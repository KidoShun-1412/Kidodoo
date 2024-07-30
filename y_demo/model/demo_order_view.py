from odoo import fields, models, api

SO_STATE = [
    ('draft', "Quotation"),
    ('sent', "Quotation Sent"),
    ('sale', "Sales Order"),
    ('cancel', "Cancelled"),
]

class DemoOrderView(models.Model):
    _name = 'demo.order.view'

    sale_person_ids = fields.Many2many(
        'res.users', string='Sale Persons',
    )
    partner_id = fields.Many2one(
        'res.partner', string='Customer',
    )
    state = fields.Selection(
        selection=SO_STATE,
    )

    # ######## API get Data #########
    @api.model
    def get_sale_orders(self, filter_vals):
        partner_id = filter_vals.get('partner_id', False) or False
        state = filter_vals.get('state', False) or False
        sale_person_ids = filter_vals.get('state', []) or []
        return self.env['sale.order'].search_read(
            [
                ('partner_id', '=', partner_id),
                ('state', '=', state),
                # ('user_id', 'in', sale_person_ids)
            ],
            ['id', 'name', 'state']
        )
