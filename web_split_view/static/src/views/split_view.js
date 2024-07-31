/** @odoo-module */
import { visitXML } from "@web/core/utils/xml";
import { registry } from "@web/core/registry";
import { SplitListController } from "./split_list_controller";
import { SplitRenderer } from "./split_list_renderer";
import { listView } from "@web/views/list/list_view";
import { FormArchParser } from "@web/views/form/form_arch_parser";

export const splitView = {
    ...listView,
    type: "split",
    display_name: "Split",
    icon: "oi oi-text-wrap fa-rotate-180",
    Controller: SplitListController,
    Renderer: SplitRenderer,

    props: (genericProps, view) => {
        const { ArchParser } = view;
        const { arch, relatedModels, resModel } = genericProps;
        let formViewId = 0
        let treeViewId = 0
        let archInfo = {}
        let formArchInfo = {}

        if (arch.hasAttribute("form_view_id")) {
            formViewId = parseInt(arch.getAttribute("form_view_id"), 10);
        }
        if (arch.hasAttribute("tree_view_id")) {
            treeViewId = parseInt(arch.getAttribute("tree_view_id"), 10);
        }

        visitXML(arch, (node) => {
            if (node.tagName === "tree") {
                archInfo = new ArchParser().parse(node, relatedModels, resModel);
                return false;
            }
            else if (node.tagName === "form") {
                formArchInfo = new FormArchParser().parse(node, relatedModels, resModel);
                return false;
            }
        })
        return {
            ...genericProps,
            Model: view.Model,
            Renderer: view.Renderer,
            buttonTemplate: view.buttonTemplate,
            archInfo,
            formViewId,
            formArchInfo,
            treeViewId
        };
    },

};

registry.category("views").add("split", splitView);
