# -*- coding:utf-8 -*-
{
    "name": "Kido Demo",
    "summary": "Module for demo all kido modules",
    "version": "17.0.1.0.0",
    "category": "Kido/Kido",
    "depends": [
        "base",
        "web",
        "custom_form",
        "web_split_view",
        "sale_management"
    ],
    "data": [
        "menu/menu.xml",
        "views/sale_order_views.xml",
    ],
    "assets": {
        "web.assets_backend": [
            "y_demo/static/src/component/**/*",
        ]
    },
    "images": [
    ],
    "installable": True,
}