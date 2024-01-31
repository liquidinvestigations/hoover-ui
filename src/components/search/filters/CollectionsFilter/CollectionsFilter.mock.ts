import { Category, CollectionData } from '../../../../Types'

export const collectionsData: CollectionData[] = [
    {
        name: 'uploads' as Category,
        title: 'uploads',
        stats: {
            counts: {
                files: 2251,
                blob_count: 17588,
                directories: 16,
                blob_total_size: 1892391697,
                blob_total_count: 17556,
                archive_source_size: 0,
                archive_source_count: 0,
                collection_source_size: 152550706,
                collection_source_count: 32,
            },
            db_size: 185181039,
            options:
                '{\n  "default_table_header": "",\n  "explode_table_rows": false,\n  "image_classification_classify_images_enabled": true,\n  "image_classification_object_detection_enabled": false,\n  "max_result_window": 10000,\n  "nlp_entity_extraction_enabled": true,\n  "nlp_fallback_language": "en",\n  "nlp_language_detection_enabled": true,\n  "ocr_languages": [\n    "eng",\n    "ron"\n  ],\n  "pdf_preview_enabled": true,\n  "process": true,\n  "refresh_interval": "1s",\n  "s3_blobs_access_key": "",\n  "s3_blobs_address": "",\n  "s3_blobs_secret_key": "",\n  "sync": true,\n  "thumbnail_generator_enabled": true,\n  "translation_enabled": false,\n  "translation_target_languages": "en",\n  "translation_text_length_limit": 400,\n  "unpack_tables_enabled": false\n}',
            task_matrix: [
                ['archives.unarchive', 'filesystem', '17', '', '', 0.01, '', '8.51 MB', '4m 10s', '1h 10m 58s', '0.01 B/s', '34.8 KB/s'],
                ['digests.bulk_index', 'digests', 1827, '', '', 0.01, '', '858 KB', '0.04s', '1m 3s', '0.01 B/s', '21.2 MB/s'],
                ['digests.gather', 'digests', 1827, '', '', 0.01, '', '858 KB', '0.264s', '7m 52s', '0.01 B/s', '3.18 MB/s'],
                ['digests.index', 'digests', 1827, '', '', 0.01, '', '858 KB', '0.333s', '9m 58s', '0.01 B/s', '2.52 MB/s'],
                ['digests.launch', 'digests', 1827, '', '', 0.01, '', '858 KB', '0.643s', '19m 25s', '0.01 B/s', '1.31 MB/s'],
                ['email.msg_to_eml', 'default', '', '', '', '', '', '', '', '', '', ''],
                ['email.parse', 'default', '', '', '', '', '', '', '', '', '', ''],
                ['emlx.reconstruct', 'default', '', '', '', '', '', '', '', '', '', ''],
                ['entities.detect_language', 'entities', 679, '', '', 0.01, '', '824 KB', '0.044s', '26.0s', '0.01 B/s', '18.4 MB/s'],
                ['entities.get_entity_results', 'entities', 668, '', '', 0.01, '', '800 KB', '1.637s', '18m 10s', '0.01 B/s', '489 KB/s'],
                ['entities.translate', 'translate', '', '', '', '', '', '', '', '', '', ''],
                ['exif.extract', 'default', 62, '', '', 0.01, '', '1017 KB', '0.036s', '1.0s', '0.01 B/s', '27.8 MB/s'],
                ['filesystem.create_archive_files', 'default', 17, '', '', 0.01, '', '13 KB', '1.205s', '20.0s', '0.01 B/s', '10.8 KB/s'],
                ['filesystem.create_attachment_files', 'default', '', '', '', '', '', '', '', '', '', ''],
                ['filesystem.handle_file', 'filesystem', 2251, '', '', 0.01, '', '13 KB', '0.166s', '6m 1s', '0.01 B/s', '78.5 KB/s'],
                ['filesystem.walk', 'filesystem', 1, 1, '13 KB', 0.5, '1.602s', '13 KB', '1.607s', '1.0s', '8.17 KB/s', '8.09 KB/s'],
                ['image_classification.classify_image', 'img-cls', 1462, '', '', 0.01, '', '920 KB', '0.353s', '8m 28s', '0.01 B/s', '2.55 MB/s'],
                ['image_classification.detect_objects', 'img-cls', '', '', '', '', '', '', '', '', '', ''],
                ['ocr.run_tesseract', 'ocr', 3642, '', '', 0.01, '', '860 KB', '5.453s', '5h 30m 42s', '0.01 B/s', '158 KB/s'],
                ['ocr.walk_file', 'filesystem', '', '', '', '', '', '', '', '', '', ''],
                ['ocr.walk_source', 'filesystem', '', '', '', '', '', '', '', '', '', ''],
                ['pdf_preview.get_pdf', 'pdf-preview', '', '', '', '', '', '', '', '', '', ''],
                ['thumbnails.get_thumbnail', 'thumbnails', 1821, '', '', 0.01, '', '804 KB', '0.451s', '13m 32s', '0.01 B/s', '1.74 MB/s'],
                ['tika.rmeta', 'tika', 1822, '', '', 0.01, '', '860 KB', '0.132s', '3m 51s', '0.01 B/s', '6.37 MB/s'],
            ],
            error_counts: [],
            progress_str: '100.0% done, sync ON',
            processing_enabled: true,
            task_matrix_header: [
                'func',
                'queue',
                'success',
                '5m_count',
                '5m_avg_size',
                '5m_avg_workers',
                '5m_avg_duration',
                'success_avg_size',
                'success_avg_duration',
                'success_total_duration',
                '5m_avg_bytes_sec',
                'success_avg_bytes_sec',
            ],
            stats_collection_time: 1,
        },
    },
    {
        name: 'testdata' as Category,
        title: 'testdata',
        stats: {
            counts: {
                files: 3626,
                blob_count: 3885,
                directories: 1234,
                blob_total_size: 311001558,
                blob_total_count: 3674,
                archive_source_size: 0,
                archive_source_count: 0,
                collection_source_size: 591140767,
                collection_source_count: 211,
            },
            db_size: 2301461359,
            options:
                '{\n  "default_table_header": "",\n  "explode_table_rows": false,\n  "image_classification_classify_images_enabled": true,\n  "image_classification_object_detection_enabled": true,\n  "max_result_window": 10000,\n  "nlp_entity_extraction_enabled": true,\n  "nlp_fallback_language": "en",\n  "nlp_language_detection_enabled": true,\n  "ocr_languages": [\n    "eng",\n    "ron"\n  ],\n  "pdf_preview_enabled": true,\n  "process": true,\n  "refresh_interval": "1s",\n  "s3_blobs_access_key": "",\n  "s3_blobs_address": "",\n  "s3_blobs_secret_key": "",\n  "sync": false,\n  "thumbnail_generator_enabled": true,\n  "translation_enabled": true,\n  "translation_target_languages": "en,ru",\n  "translation_text_length_limit": "200",\n  "unpack_tables_enabled": false\n}',
            task_matrix: [
                ['archives.unarchive', '', 'filesystem', 3, 209, 0.01, '529 KB', '2.034s', '7m 3s', '0.01 B/s', '260 KB/s'],
                ['digests.bulk_index', '', 'digests', '', 1183, 0.01, '576 KB', '0.039s', '40.0s', '0.01 B/s', '14.3 MB/s'],
                ['digests.gather', '', 'digests', 5, 1178, '', '574 KB', '0.125s', '2m 20s', '0.01 B/s', '4.5 MB/s'],
                ['digests.index', '', 'digests', '', 1183, 0.01, '576 KB', '0.041s', '42.0s', '0.01 B/s', '13.8 MB/s'],
                ['digests.launch', '', 'digests', '', 1183, 0.01, '576 KB', '0.632s', '12m 21s', '0.01 B/s', '911 KB/s'],
                ['email.msg_to_eml', '', 'default', '', 1, 0.01, '32.5 KB', '0.191s', '', '0.01 B/s', '170 KB/s'],
                ['email.parse', '', 'default', 1, 64, 0.01, '160 KB', '3.1s', '3m 18s', '0.01 B/s', '51.5 KB/s'],
                ['emlx.reconstruct', '', 'default', '', 2, 0.01, '13 KB', '0.589s', '1.0s', '0.01 B/s', '22.1 KB/s'],
                ['entities.detect_language', '', 'entities', '', 6, 0.01, '62.9 KB', '0.058s', '', '0.01 B/s', '1.06 MB/s'],
                ['entities.get_entity_results', '', 'entities', '', 6, 0.01, '62.9 KB', '2.005s', '12.0s', '0.01 B/s', '31.4 KB/s'],
                ['entities.translate', '', 'translate', '', '', '', '', '', '', '', ''],
                ['exif.extract', 1, 'default', '', 62, 0.01, '2.3 MB', '7.462s', '7m 42s', '0.01 B/s', '315 KB/s'],
                ['filesystem.create_archive_files', '', 'default', '', 255, 0.01, '13 KB', '0.111s', '27.0s', '0.01 B/s', '117 KB/s'],
                ['filesystem.create_attachment_files', '', 'default', '', 79, 0.01, '13 KB', '0.361s', '28.0s', '0.01 B/s', '36 KB/s'],
                ['filesystem.handle_file', '', 'filesystem', '', 3626, 0.01, '13 KB', '0.181s', '10m 37s', '0.01 B/s', '72 KB/s'],
                ['filesystem.walk', '', 'filesystem', '', 455, 0.01, '13 KB', '6.19s', '46m 54s', '0.01 B/s', '2.11 KB/s'],
                ['image_classification.classify_image', 4, 'img-cls', 4, 171, '', '1.23 MB', '1.642s', '4m 39s', '0.01 B/s', '763 KB/s'],
                ['image_classification.detect_objects', '', 'img-cls', '', '', '', '', '', '', '', ''],
                ['ocr.run_tesseract', '', 'ocr', 2, 420, 0.01, '1.03 MB', '15.643s', '1h 49m 27s', '0.01 B/s', '66.8 KB/s'],
                ['ocr.walk_file', '', 'filesystem', '', '', '', '', '', '', '', ''],
                ['ocr.walk_source', '', 'filesystem', '', '', '', '', '', '', '', ''],
                ['pdf_preview.get_pdf', '', 'pdf-preview', '', 23, 0.01, '1.9 MB', '14.683s', '5m 37s', '0.01 B/s', '133 KB/s'],
                ['thumbnails.get_thumbnail', '', 'thumbnails', 18, 225, '', '821 KB', '3.887s', '14m 33s', '0.01 B/s', '212 KB/s'],
                ['tika.rmeta', '', 'tika', 62, 478, 0.01, '573 KB', '0.268s', '2m 5s', '0.01 B/s', '2.09 MB/s'],
            ],
            error_counts: [
                {
                    func: 'image_classification.classify_image',
                    count: 4,
                    error_type: '(E) ValueError',
                },
                {
                    func: 'exif.extract',
                    count: 1,
                    error_type: '(E) NoParser',
                },
                {
                    func: 'tika.rmeta',
                    count: 61,
                    error_type: '(B) tika_http_404',
                },
                {
                    func: 'thumbnails.get_thumbnail',
                    count: 14,
                    error_type: '(B) thumbnail_http_500',
                },
                {
                    func: 'digests.gather',
                    count: 5,
                    error_type: '(B) dependency_has_error',
                },
                {
                    func: 'image_classification.classify_image',
                    count: 4,
                    error_type: '(B) image_classification_jpg_conversion_error',
                },
                {
                    func: 'thumbnails.get_thumbnail',
                    count: 3,
                    error_type: '(B) thumbnail_http_502',
                },
                {
                    func: 'ocr.run_tesseract',
                    count: 2,
                    error_type: '(B) pdf_ocr_pdf2pdfocr_failed',
                },
                {
                    func: 'archives.unarchive',
                    count: 2,
                    error_type: '(B) 7z_error',
                },
                {
                    func: 'thumbnails.get_thumbnail',
                    count: 1,
                    error_type: '(B) thumbnail_http_404',
                },
                {
                    func: 'email.parse',
                    count: 1,
                    error_type: '(B) gpg_decrypt_failed',
                },
                {
                    func: 'tika.rmeta',
                    count: 1,
                    error_type: '(B) tika_error_on_large_file',
                },
                {
                    func: 'archives.unarchive',
                    count: 1,
                    error_type: '(B) pdfimages_error',
                },
            ],
            progress_str: '100.0% done, 0.92% errors',
            processing_enabled: true,
            task_matrix_header: [
                'func',
                'error',
                'queue',
                'broken',
                'success',
                '5m_avg_workers',
                'success_avg_size',
                'success_avg_duration',
                'success_total_duration',
                '5m_avg_bytes_sec',
                'success_avg_bytes_sec',
            ],
            stats_collection_time: 1,
        },
    },
]

const categoryQuickFilter: Partial<Record<Category, string>> = {
    collections: 'uploads',
}

const searchCollections: string[] = []

const resultsCounts: Record<string, number> = {
    uploads: 100,
    testdata: 200,
}

export const mockSearchStore = {
    collectionsData,
    searchStore: {
        searchViewStore: {
            categoryQuickFilter,
            searchCollections,
        },
        searchResultsStore: { resultsCounts },
    },
}
