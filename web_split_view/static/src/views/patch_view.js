/** @odoo-module **/

import { patch } from "@web/core/utils/patch";
import { View } from "@web/views/view";
import { pick } from "@web/core/utils/objects";
import { FormStatusIndicator } from "@web/views/form/form_status_indicator/form_status_indicator";
import { useBus } from "@web/core/utils/hooks";
import { parseXML } from "@web/core/utils/xml";
import { nbsp } from "@web/core/utils/strings";
import { registry } from "@web/core/registry";
import { _t } from "@web/core/l10n/translation";
import { editModelDebug } from "@web/core/debug/debug_utils";


import { editView } from "@web/views/debug_items";
const debugRegistry = registry.category("debug");

//------------------------------------------------------------------------------
// Edit View
//------------------------------------------------------------------------------

export function extendEditView({ accessRights, component, env }) {
    const res = editView({accessRights, component, env})

    if (component.env.isSplitForm) {
        let { viewId, viewType: type } = component.env.config || {};
        viewId = component.props.splitConfig.viewId
        type = component.props.splitConfig.viewType
        const displayName = type[0].toUpperCase() + type.slice(1);
        const description = _t("Edit View: ") + displayName;
        return {
            type: "item",
            description,
            callback: () => {
                editModelDebug(env, description, "ir.ui.view", viewId);
            },
            sequence: 350,
        };
    }
    return res
}

debugRegistry.category("view").remove("editView");
debugRegistry.category("view").add("editView", extendEditView);


patch(View.prototype, {

    // Override
    onWillUpdateProps(nextProps) {
        let newProps = pick(nextProps, "arch", "type", "resModel");
        let oldProps = pick(this.props, "arch", "type", "resModel");
        // Trigger re-render view when resId changed (only apply with split form)
        if (this.props.type === 'split_form') {
            newProps = pick(nextProps, "arch", "type", "resModel", "resId");
            oldProps = pick(this.props, "arch", "type", "resModel", "resId");
        }

        if (JSON.stringify(oldProps) !== JSON.stringify(newProps)) {
            return this.loadView(nextProps);
        }
        // we assume that nextProps can only vary in the search keys:
        // comparison, context, domain, groupBy, orderBy
        const { comparison, context, domain, groupBy, orderBy } = nextProps;
        Object.assign(this.withSearchProps, { comparison, context, domain, groupBy, orderBy });
    },

    async loadView(props) {
        await super.loadView(...arguments)

        if (
            this.props.type == 'split'
            && Object.keys(this.componentProps.archInfo || {}).length === 0
        ){
            const descr = registry.category("views").get(props.type);
            const treeViewId = parseInt(this.componentProps.arch.getAttribute("tree_view_id"), 10);
            const views = [[treeViewId, 'list']]
            const { context, resModel, loadActionMenus, loadIrFilters } = props;
            const split_result = await this.viewService.loadViews(
                { context, resModel, views},
                { actionId: this.env.config.actionId, loadActionMenus, loadIrFilters }
            );
            const treeArchXml = parseXML(split_result.views.list.arch.replace(/&amp;nbsp;/g, nbsp))
            const ArchParser = descr.ArchParser
            const archInfo = new ArchParser().parse(treeArchXml, this.componentProps.relatedModels, resModel);
            this.componentProps.archInfo = archInfo
        }

        if ( this.props.type == 'split_form' ){
            const forceFormArch = this.env.getForceSplitFormArch()
            if (Object.keys(forceFormArch || {}).length > 0) {
                this.componentProps.archInfo = forceFormArch
            }
        }
    }

})

patch(FormStatusIndicator.prototype, {
    setup() {
        super.setup()
        if (this.env.splitFormViewBus) {
            useBus(
                this.env.splitFormViewBus,
                "reload-form-status-indicator",
                () => {
                    this.render()
                }
            );
        }
    }
})

