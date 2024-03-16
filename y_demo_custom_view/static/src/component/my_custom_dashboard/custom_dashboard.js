/** @odoo-module **/

import { Component, useState, useEffect } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { CustomForm } from "@custom_form/component/custom_form/custom_form"
import { useService } from "@web/core/utils/hooks";

export class DemoCustomDashboard extends Component {
    setup() {
        this.modelName = this.props.action.params.modelName
        this.fields = this.props.action.params.fields
    }

    get propComponent() {
        return DemoCustomScreen
    }

}
DemoCustomDashboard.template = 'demo_custom_dashboard.DemoCustomDashboard'
DemoCustomDashboard.components = { CustomForm }
DemoCustomDashboard.props = {
    params: Object,
};
registry.category("actions").add("demo_custom_form_view", DemoCustomDashboard);

class DemoCustomScreen extends Component {
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

    async updateStateByFilter() {
        this.state.orderData = await this.getSaleOrders()
    }

    async getSaleOrders() {
        return await this.orm.call(
            'abstract.demo.order.view', 'get_sale_orders', [this.props.filter]
        )
    }

}
DemoCustomScreen.template = 'demo_custom_dashboard.DemoCustomScreen'