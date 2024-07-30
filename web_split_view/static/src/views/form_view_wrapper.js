/** @odoo-module **/

import { Component, useState } from "@odoo/owl";
import { useBus } from "@web/core/utils/hooks";
import { View } from "@web/views/view";

export class FormViewWrapper extends Component {
    setup() {
        this.state = useState({
            'resId' : false,
            'resModel': false,
        })
        useBus(this.env.splitViewBus, "reload-split-form", async (ev) => {
            this.state.resId = ev.detail.resId
            this.state.resModel = ev.detail.resModel
        });
    }
}
FormViewWrapper.template = 'split_view.FormViewWrapper'
FormViewWrapper.components = { View };
FormViewWrapper.props = {
    reloadSplitListRecords: Function,
    adjustChatter: Function,
    formViewId: {type: Number, optional: true}
}
