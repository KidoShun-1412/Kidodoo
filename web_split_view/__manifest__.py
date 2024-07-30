# -*- coding: utf-8 -*-
{
    'name': 'Web Split View',
    'version':  '17.0.1.0.0',
    'category': 'Tools',
    "license": "LGPL-3",
    'summary': """""",
    "author": "Trobz",

    'website': 'http://www.trobz.com',
    'depends': ["web"],
    'data': [],

    "assets": {
        "web.assets_backend": [
            "web_split_view/static/src/views/split_form_controller.js",

            "web_split_view/static/src/views/split_view_service.js",

            "web_split_view/static/src/views/form_view_wrapper.js",
            "web_split_view/static/src/views/form_view_wrapper.xml",

            "web_split_view/static/src/views/split_list_renderer.js",
            "web_split_view/static/src/views/split_list_renderer.scss",

            "web_split_view/static/src/views/split_list_controller.js",
            "web_split_view/static/src/views/split_list_controller.xml",

            "web_split_view/static/src/views/split_view.js",
            "web_split_view/static/src/views/patch_view.js",
            "web_split_view/static/src/views/control_panel.xml",

        ]
    },
}
