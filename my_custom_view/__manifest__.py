# -*- coding:utf-8 -*-
{
    "name": "My Custom View",
    "summary": "My Custom View",
    "version": "17.0.1.0.0",
    "category": "Custom View",
    "depends": [
        "base",
        "web",
        "custom_form",
        "sale_management"
    ],
    "data": [
        "menu/menu.xml",
    ],
    "assets": {
        "web.assets_backend": [
            "my_custom_view/static/src/component/**/*",
        ]
    },
    "images": [
    ],
    "installable": True,
}