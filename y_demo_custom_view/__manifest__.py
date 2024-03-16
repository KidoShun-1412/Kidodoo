# -*- coding:utf-8 -*-
{
    "name": "Demo Custom View",
    "summary": "Demo Custom View",
    "version": "17.0.1.0.0",
    "category": "Kido",
    "depends": [
        "base",
        "web",
        "custom_form",
        # "sale_management"
    ],
    "data": [
        "menu/menu.xml",
    ],
    "assets": {
        "web.assets_backend": [
            "y_demo_custom_view/static/src/component/**/*",
        ]
    },
    "images": [
    ],
    "installable": True,
}