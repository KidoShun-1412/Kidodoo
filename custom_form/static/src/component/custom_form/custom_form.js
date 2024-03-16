/** @odoo-module **/

import { Component, useState, onWillStart } from "@odoo/owl";

import { useService } from "@web/core/utils/hooks";

import { useModel } from "@web/model/model";
import { RelationalModel } from "@web/model/relational_model/relational_model";
import { Field, getPropertyFieldInfo } from "@web/views/fields/field";

import { createPropertyActiveField} from "@web/model/relational_model/utils";


class _CustomForm extends Component {
    static template = "custom_form._CustomForm";
    static components = { Field };
    static props = ["fields", "model"];

    setup() {
        this.model = useState(useModel(RelationalModel, this.modelParams, {}));
    }

    get record() {
        return this.model.root;
    }

    get fieldList() {
        return Object.values(this.props.fields)
    }

    get modelParams() {
        let { fields, model } = this.props;
        let activeFields = {};

        for (let [key, field] of Object.entries(fields)) {
            activeFields[key] = createPropertyActiveField(field);
            activeFields[key].onChange = true;
        }

        return {
            config: {
                resModel: model,
                fields: fields,
                activeFields: activeFields,
                isMonoRecord: true,
                mode: "edit",
                context: {},
            },
        };
    }

    get customScreenProps() {
        return {
            'model': this.props.model,
            'fields': this.fieldList,
            'filter': this.currentFilter
        }
    }

    get rootData() {
        return this.model.root.data
    }

    get currentFilter() {
        let filter = {}

        this.fieldList.forEach(field => {
            let fieldName = field.name
            if (field.type == 'many2one') {
                if (Array.isArray(this.rootData[fieldName])
                    && this.rootData[fieldName].length > 0
                ){
                    filter[fieldName] = this.rootData[fieldName][0]
                }
                else {
                    filter[fieldName] = false
                }
            }
            else if (field.type == 'many2many'){
                if (Array.isArray(this.rootData[fieldName].records)
                    && this.rootData[fieldName].records.length > 0
                ) {
                    filter[fieldName] = this.rootData[fieldName].records.map(f => f.data.id)
                }
                else {
                    filter[fieldName] = []
                }
            }
            else {
                filter[fieldName] = this.rootData[fieldName]
            }

        });
        return filter
    }

    getFieldInfo(fieldName) {
        let fieldInfo = getPropertyFieldInfo(this.props.fields[fieldName]);
        if (
            ["many2one", "many2many"].includes(fieldInfo.type) &&
            fieldInfo.domain.length == 0
        ) {
            delete fieldInfo.domain;
        }
        return fieldInfo;
    }

    getFieldProps(fieldName) {
        return {
            record: this.record,
            name: fieldName,
            fieldInfo: this.getFieldInfo(fieldName),
        }
    }

}

export class CustomForm extends Component {
    setup() {
        this.orm = useService("orm");
        onWillStart(async () => {
            this.fields = await this.orm.call(
                this.props.modelName, "fields_get", [this.props.fields], {}
            )
        });
    }
}
CustomForm.template = 'custom_form.CustomForm'
CustomForm.components = { _CustomForm };
CustomForm.props = {
    modelName: String,
    fields: Array
};
