/** @odoo-module **/

import { Component, useState, useEffect } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";
import { registry } from "@web/core/registry";
import { CustomForm } from "@custom_form/component/custom_form/custom_form"

class CustomDashboardScreen extends Component {
    setup() {

        this.orm = useService('orm')
        this.state = useState({
            orderData: []
        })

        useEffect(
            () => {
                this.updateStateByFilter()
            },
            () => [this.props.filter]
        );
    }

    get displayFields () {
        return {
            'name': 'Number',
            'partner_name': 'Customer',
            'date_order': 'Order Date',
            'amount_total': 'Total Amount',
            'state': 'State',
        }
    }

    get displayFieldValues() {
        return Object.values(this.displayFields)
    }

    get displayFieldKeys() {
        return Object.keys(this.displayFields)
    }

    async updateStateByFilter() {
        this.state.orderData = await this.getSaleOrders()
    }

    // Call Get Data
    async getSaleOrders() {
        return await this.orm.call(
            'my.custom.order.dashboard', 'get_sale_orders', [this.props.filter]
        )
    }

}
CustomDashboardScreen.template = 'custom_dashboard.CustomDashboardScreen'

export class CustomDashboard extends Component {
    setup() {
        this.modelName = this.props.action.params.modelName
        this.fields = this.props.action.params.fields
    }

    get propComponent() {
        return CustomDashboardScreen
    }

}
CustomDashboard.template = 'custom_dashboard.MyCustomDashboard'
CustomDashboard.components = { CustomForm }
CustomDashboard.props = {
    params: Object,
};
registry.category("actions").add("my_custom_form_view", CustomDashboard);