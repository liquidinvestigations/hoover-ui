import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import {
    faAngleDoubleRight,
    faEnvelope,
    faFile,
    faFileArchive,
    faFileAudio,
    faFileCode,
    faFileExcel,
    faFileImage,
    faFilePdf,
    faFileAlt,
    faFileVideo,
    faFileWord,
    faFolder,
    faLayerGroup,
    faMapPin,
    faRedoAlt,
    faSearch,
    faSearchPlus,
} from '@fortawesome/free-solid-svg-icons'

import {
    AccountTree,
    AccountTreeOutlined,
    AlternateEmail,
    Apps,
    ArrowDownward,
    ArrowDropDown,
    ArrowUpward,
    AttachFile,
    Cancel,
    Category,
    ChevronLeft,
    ChevronRight,
    ChromeReaderMode,
    Close,
    CloudDownload,
    CloudDownloadOutlined,
    CodeOutlined,
    DateRange,
    Delete,
    DeleteOutlined,
    Error,
    ErrorOutline,
    Event,
    ExpandMore,
    Folder,
    FolderOutlined,
    Fullscreen,
    FullscreenExit,
    Language,
    Launch,
    Link,
    List,
    LocalOffer,
    LocalOfferOutlined,
    Lock,
    LockOpen,
    MoreHoriz,
    MoreVert,
    Print,
    SettingsApplicationsOutlined,
    SettingsEthernet,
    Sort,
    Star,
    StarOutline,
    Subject,
    Toc,
    Translate,
    ViewStream,
    Visibility,
    VisibilityOffOutlined,
    ZoomIn,
    ZoomOut,
} from '@material-ui/icons'

const FAIcon = ({ icon, style, className }) => React.createElement(FontAwesomeIcon, {
    icon,
    className,
    size: 'lg',
    style: {
        width: '1em',
        ...style,
    }
})

export const reactIcons = {
    categoryCollections:        <FAIcon icon={faLayerGroup} style={{ width: '1.25em' }} />,
    categoryTags:               <LocalOffer />,
    categoryDates:              <DateRange />,
    categoryType:               <Category />,
    categoryLanguage:           <Language/>,
    categoryEmail:              <AlternateEmail/>,
    categoryLocation:           <AccountTree />,
    categorySize:               <SettingsEthernet />,
    ocr:                        <Translate/>,
    event:                      <Event />,
    tree:                       <AccountTree />,
    chevronLeft:                <ChevronLeft />,
    chevronRight:               <ChevronRight />,
    chevronDown:                <ExpandMore />,
    arrowUp:                    <ArrowUpward />,
    arrowDown:                  <ArrowDownward />,
    dropDown:                   <ArrowDropDown />,
    location:                   <Folder />,
    contentFiles:               <FolderOutlined />,
    pinned:                     <FAIcon icon={faMapPin} />,
    unpinned:                   <FAIcon icon={faMapPin} />,
    doubleArrow:                <FAIcon icon={faAngleDoubleRight} />,
    cancel:                     <Cancel />,
    delete:                     <Delete />,
    deleteOutlined:             <DeleteOutlined />,
    visibility:                 <Visibility />,
    visibilityOutlined:         <VisibilityOffOutlined />,
    recommended:                <Error />,
    recommendedOutlined:        <ErrorOutline />,
    star:                       <Star />,
    starOutlined:               <StarOutline />,
    download:                   <CloudDownload />,
    downloadOutlined:           <CloudDownloadOutlined />,
    content:                    <Subject />,
    privateTag:                 <Lock />,
    publicTag:                  <LockOpen />,
    close:                      <Close />,
    sort:                       <Sort />,
    pgp:                        <Lock />,
    openNewTab:                 <Launch />,
    attachment:                 <AttachFile />,
    zoomIn:                     <ZoomIn />,
    zoomOut:                    <ZoomOut />,
    fullscreen:                 <Fullscreen />,
    fullscreenExit:             <FullscreenExit />,
    print:                      <Print />,
    contentTab:                 <Toc />,
    tagsTab:                    <LocalOfferOutlined />,
    metaTab:                    <SettingsApplicationsOutlined />,
    codeTab:                    <CodeOutlined />,
    headersTab:                 <AccountTreeOutlined />,
    moreFiles:                  <MoreHoriz />,
    search:                     <FAIcon icon={faSearch} />,
    batchSearch:                <FAIcon icon={faSearchPlus} />,
    refresh:                    <FAIcon icon={faRedoAlt} />,
    tableView:                  <List />,
    listView:                   <ViewStream />,
    more:                       <MoreVert />,
    viewerSidePanel:            <ChromeReaderMode />,
    link:                       <Link />,
    thumbnails:                 <Apps />,

    typeArchive:                <FAIcon icon={faFileArchive} style={{ width: '1.25em' }} />,
    typeAudio:                  <FAIcon icon={faFileAudio} style={{ width: '1.25em' }} />,
    typeDoc:                    <FAIcon icon={faFileWord} style={{ width: '1.25em' }} />,
    typeEmail:                  <FAIcon icon={faEnvelope} style={{ width: '1.25em' }} />,
    typeEmailArchive:           <FAIcon icon={faFileArchive} style={{ width: '1.25em' }} />,
    typeFile:                   <FAIcon icon={faFile} style={{ width: '1.25em' }} />,
    typeFolder:                 <FAIcon icon={faFolder} style={{ width: '1.25em' }} />,
    typeHtml:                   <FAIcon icon={faFileCode} style={{ width: '1.25em' }} />,
    typeImage:                  <FAIcon icon={faFileImage} style={{ width: '1.25em' }} />,
    typePdf:                    <FAIcon icon={faFilePdf} style={{ width: '1.25em' }} />,
    typeText:                   <FAIcon icon={faFileAlt} style={{ width: '1.25em' }} />,
    typeVideo:                  <FAIcon icon={faFileVideo} style={{ width: '1.25em' }} />,
    typeXls:                    <FAIcon icon={faFileExcel} style={{ width: '1.25em' }} />,
}
