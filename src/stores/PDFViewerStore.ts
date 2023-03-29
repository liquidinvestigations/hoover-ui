import { makeAutoObservable, reaction, runInAction } from 'mobx'
import { getDocument, GlobalWorkerOptions, PasswordResponses, PDFDocumentProxy, PDFPageProxy, PDFWorker } from 'pdfjs-dist'
import { OnProgressParameters } from 'pdfjs-dist/types/src/display/api'
import { createRef, KeyboardEvent, MouseEvent } from 'react'
import screenfull from 'screenfull'

import { zoomIn, zoomOut } from '../components/pdf-viewer/zooming'

if (typeof window !== 'undefined' && 'Worker' in window) {
    GlobalWorkerOptions.workerSrc = '/_next/static/pdf.worker.js'
}

import { HashStateStore } from './HashStateStore'

type SidebarTab = 'attachments' | 'bookmarks' | 'thumbnails'

export enum PDFStatus {
    LOADING = 'loading',
    COMPLETE = 'complete',
    ERROR = 'error',
    NEED_PASSWORD = 'need-password',
    INCORRECT_PASSWORD = 'incorrect-password',
}

export interface PDFPageProps {
    width: number
    height: number
    scale: number
}

export interface PDFExternalLink {
    pageIndex: number
    url: string
}

export interface PDFPageData {
    page?: PDFPageProxy
    width?: number
    height?: number
    rotation: number
}

export interface BookmarksTreeItem {
    title: string
    dest: string
    index: number
    items: BookmarksTreeItem[]
}

const PAGE_INDEX_CHANGE_DELAY = 300

const debounce = (fn: Function, wait: number = 0): ((args: typeof fn.arguments) => void) => {
    let t: ReturnType<typeof setTimeout>
    return () => {
        clearTimeout(t)
        t = setTimeout(() => fn.apply(fn, fn.arguments), wait)
    }
}

const pageMargin = 20

export class PDFViewerStore {
    cMapUrl = '/build/static/cmaps'

    cMapPacked = true

    withCredentials = true

    viewerRef: HTMLDivElement | undefined

    containerRef: HTMLDivElement | undefined

    sidebarRef: HTMLDivElement | undefined

    pagesRefs: HTMLDivElement[] = []

    thumbnailsRefs: HTMLDivElement[] = []

    pageVisibility: number[] = []

    sidebarTab: SidebarTab = 'thumbnails'

    sidebarOpen = false

    scaleMenuAnchorEl: Element | null = null

    pageInputRef = createRef<HTMLInputElement>()

    pageIndex = 0

    rotation = 0

    scale = 1

    doc: PDFDocumentProxy | undefined

    firstPageProps: PDFPageProps | undefined

    percent: number = 0

    status: PDFStatus = PDFStatus.LOADING

    bookmarks: BookmarksTreeItem[] = []

    expandedBookmarks: string[] = []

    externalLinks: { [pageIndex: number]: PDFExternalLink[] } = {}

    error: any

    constructor(private readonly hashStore: HashStateStore) {
        makeAutoObservable(this)

        reaction(
            () => this.hashStore.hashState?.previewPage,
            (previewPage) => {
                const page = previewPage ? parseInt(previewPage) : NaN
                if (!isNaN(page)) {
                    this.pageIndex = page - 1
                } else {
                    this.pageIndex = 0
                }
            }
        )

        reaction(
            () => this.firstPageProps?.width && this.containerRef,
            () => {
                if (this.firstPageProps?.width && this.containerRef) {
                    const containerWidth = this.containerRef.clientWidth
                    if (this.firstPageProps.width > containerWidth) {
                        this.setScale(containerWidth / this.firstPageProps.width)
                    }
                }
            }
        )

        reaction(
            () => this.status && this.pageIndex && this.pagesRefs,
            () => {
                if (this.status === PDFStatus.COMPLETE && this.pageIndex > 0 && this.pagesRefs[this.pageIndex]) {
                    this.goToPage(this.pageIndex)
                }
            }
        )
    }

    setViewerRef = (viewerRef: HTMLDivElement) => {
        runInAction(() => {
            this.viewerRef = viewerRef
        })
    }

    setContainerRef = (containerRef: HTMLDivElement) => {
        runInAction(() => {
            this.containerRef = containerRef
        })
    }

    setSidebarRef = (sidebarRef: HTMLDivElement) => {
        runInAction(() => {
            this.sidebarRef = sidebarRef
        })
    }

    setPageRef = (pageIndex: number) => (pageRef: HTMLDivElement) => {
        runInAction(() => {
            this.pagesRefs[pageIndex] = pageRef
        })
    }

    setThumbnailRef = (thumbnailIndex: number) => (thumbnailRef: HTMLDivElement) => {
        runInAction(() => {
            this.thumbnailsRefs[thumbnailIndex] = thumbnailRef
        })
    }

    handlePageVisibilityChange = (pageIndex: number, ratio: number) => {
        if (this.status === PDFStatus.COMPLETE) {
            this.pageVisibility[pageIndex] = ratio
            const maxRatioPage = this.pageVisibility.reduce((maxIndex, item, index, array) => (item > array[maxIndex] ? index : maxIndex), 0)
            this.setPageIndex(maxRatioPage)
            this.handlePageIndexChange(maxRatioPage)
        }
    }

    handlePageIndexChange = debounce((index: number) => {
        if (index > 0) {
            this.hashStore.setHashState({ previewPage: index + 1 }, false)
        } else {
            this.hashStore.setHashState({ previewPage: undefined }, false)
        }
    }, PAGE_INDEX_CHANGE_DELAY)

    setSidebarTab = (sidebarTab: SidebarTab) => () => {
        runInAction(() => {
            this.sidebarTab = sidebarTab
        })
    }

    sidebarToggle = () => () => {
        runInAction(() => {
            this.sidebarOpen = !this.sidebarOpen
        })
    }

    setPageIndex = (pageIndex: number) => () => {
        runInAction(() => {
            this.pageIndex = pageIndex
        })
    }

    handlePrevPage = () => this.goToPage(this.pageIndex - 1)

    handleNextPage = () => this.goToPage(this.pageIndex + 1)

    handlePageInputFocus = () => this.pageInputRef.current?.select()

    handlePageInputBlur = () => this.handlePageChange()

    handlePageInputKey = (event: KeyboardEvent) => {
        if (event.keyCode === 13) {
            this.handlePageChange()
            this.pageInputRef.current?.blur()
        }
        if (
            !Array(10)
                .fill(0)
                .map((_, i) => '' + i)
                .includes(event.key)
        ) {
            event.preventDefault()
        }
    }

    handlePageChange = () => {
        if (this.pageInputRef.current) {
            const page = parseInt(this.pageInputRef.current.value)
            if (!isNaN(page) && page > 0 && page <= (this.doc?.numPages ?? 0)) {
                this.goToPage(page - 1)
            } else {
                this.pageInputRef.current.value = (this.pageIndex + 1).toString()
            }
        }
    }

    setRotation = (rotation: number) => {
        runInAction(() => {
            this.rotation = rotation
        })
    }

    setScale = (scale: number) => {
        runInAction(() => {
            this.scale = scale
        })
    }

    setScaleMenuAnchorEl = (scaleMenuAnchorEl: Element | null) => {
        runInAction(() => {
            this.scaleMenuAnchorEl = scaleMenuAnchorEl
        })
    }

    handleScaleMenuClick = (event: MouseEvent) => {
        this.setScaleMenuAnchorEl(event.currentTarget as Element)
    }

    handleScaleMenuClose = () => {
        this.setScaleMenuAnchorEl(null)
    }

    handleScaleSet = (newScale: number | 'page' | 'width') => () => {
        this.handleScaleMenuClose()
        if (this.containerRef && this.firstPageProps) {
            const containerWidth = this.containerRef.clientWidth - pageMargin
            const containerHeight = this.containerRef.clientHeight - pageMargin
            if (newScale === 'page') {
                this.setScale(Math.min(containerWidth / this.firstPageProps.width, containerHeight / this.firstPageProps.height))
            } else if (newScale === 'width') {
                this.setScale(containerWidth / this.firstPageProps.width)
            } else {
                this.setScale(newScale)

                const pageSpaces = this.pageIndex * 27
                const scrollTopPages = ((this.containerRef.scrollTop - pageSpaces) * newScale) / this.scale
                this.containerRef.scrollTop = scrollTopPages + pageSpaces
            }
        }
    }

    handleZoomOut = () => this.handleScaleSet(zoomOut(this.scale))()

    handleZoomIn = () => this.handleScaleSet(zoomIn(this.scale))()

    handleFullScreen = () => screenfull.request(this.viewerRef)

    handleFullScreenExit = () => screenfull.exit()

    setDoc = (doc: PDFDocumentProxy) => {
        runInAction(() => {
            this.doc = doc
        })
    }

    setFirstPageProps = (pageProps: PDFPageProps) => {
        runInAction(() => {
            this.firstPageProps = pageProps
        })
    }

    setPercent = (percent: number) => {
        runInAction(() => {
            this.percent = percent
        })
    }

    setStatus = (status: PDFStatus) => {
        runInAction(() => {
            this.status = status
        })
    }

    setBookmarks = (bookmarks: BookmarksTreeItem[]) => {
        runInAction(() => {
            this.bookmarks = bookmarks
        })
    }

    setExpandedBookmarks = (expandedBookmarks: string[]) => {
        runInAction(() => {
            this.expandedBookmarks = expandedBookmarks
        })
    }

    setExternalLinks = (pageIndex: number, externalLinks: PDFExternalLink[]) => {
        runInAction(() => {
            this.externalLinks[pageIndex] = externalLinks
        })
    }

    setError = (error: any) => {
        runInAction(() => {
            this.error = error
        })
    }

    loadDocument = (url: string) => {
        this.setStatus(PDFStatus.LOADING)

        const worker = new PDFWorker({ name: `PDFWorker_${Date.now()}` as unknown as null })
        const loadingTask = getDocument({
            url,
            cMapUrl: this.cMapUrl,
            cMapPacked: this.cMapPacked,
            withCredentials: this.withCredentials,
            worker,
        })

        loadingTask.onPassword = (verifyPassword: Function, reason: number) => {
            switch (reason) {
                case PasswordResponses.NEED_PASSWORD:
                    this.setStatus(PDFStatus.NEED_PASSWORD)
                    break

                case PasswordResponses.INCORRECT_PASSWORD:
                    this.setStatus(PDFStatus.INCORRECT_PASSWORD)
                    break
            }
        }

        loadingTask.onProgress = (progress: OnProgressParameters) => {
            progress.total > 0 ? this.setPercent(Math.min(100, (100 * progress.loaded) / progress.total)) : this.setPercent(100)
        }

        loadingTask.promise.then(
            (doc) => {
                this.setDoc(doc)
                doc.getPage(1).then((page) => {
                    const { width, height, scale } = page.getViewport({ scale: 1 })

                    this.setFirstPageProps({
                        width,
                        height,
                        scale,
                    })
                    this.setStatus(PDFStatus.COMPLETE)
                })
            },
            (error) => {
                this.setError(error)
                this.setStatus(PDFStatus.ERROR)
            }
        )
    }

    goToPage = (pageIndex: number) => {
        this.setPageIndex(pageIndex)
        if (this.containerRef && this.pagesRefs[pageIndex]) {
            this.containerRef.scrollTop = this.pagesRefs[pageIndex].offsetTop
        }
    }
}
