/** @odoo-module **/

import { registry } from "@web/core/registry";

export const splitViewService = {
    start(env, {}) {

        let lastResId = false

        return {
            lastResId,

            _updateLastResId(lastResId) {
                this.lastResId = lastResId
            },

        };
    },
};

registry.category("services").add("split_view_service", splitViewService);
