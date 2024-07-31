/** @odoo-module **/

import { registry } from "@web/core/registry";
import { useSubEnv, useEffect, EventBus, onMounted } from "@odoo/owl";
import { formView } from "@web/views/form/form_view";
import { FormController } from '@web/views/form/form_controller';

export class SplitFormController extends FormController {
    setup() {
        super.setup()

        useSubEnv({
            isSplitForm: true,
            splitFormViewBus: new EventBus()
        });
        useEffect(
            () => {
                this.env.splitFormViewBus.trigger('reload-form-status-indicator', false)
            },
            () => [this.props.resId, this.model.root.dirty]
        );

        onMounted(() => {
            this.props.adjustChatter()
        })

    }

    get deleteConfirmationDialogProps() {
        const props = super.deleteConfirmationDialogProps
        props.confirm = async () => {
            const resId = this.model.root.resId
            await this.model.root.delete();
            this.props.reloadSplitListRecords(resId, false, true)
            if (!this.model.root.resId) {
                this.env.config.historyBack();
            }
        }
        return props
    }

    async duplicateRecord() {
        await super.duplicateRecord(...arguments)
        this.props.reloadSplitListRecords(this.model.root.resId, true, false)
    }

    async create(params) {
        await super.create(...arguments)
        this.props.reloadSplitListRecords(false, true, false)
    }

    async save(params) {
        const saved = await super.save(...arguments)
        if (saved) {
            let isAfterCreate = false
            if (Object.keys(params || {}).length === 0) {
                isAfterCreate = true
            }
            this.props.reloadSplitListRecords(this.model.root.resId, isAfterCreate, false)
        }
        return saved
    }

    async discard() {
        await super.discard(...arguments)
        this.props.reloadSplitListRecords(this.model.root.resId, false, false)
    }

};

SplitFormController.props = {
    ...FormController.props,
    adjustChatter: {type: Function, optional:true},
    reloadSplitListRecords: {type: Function, optional:true},
    splitConfig: {type: Object, optional:true}
}

export const splitFormView = {
    ...formView,
    Controller: SplitFormController,

};

registry.category("views").add("split_form", splitFormView);
