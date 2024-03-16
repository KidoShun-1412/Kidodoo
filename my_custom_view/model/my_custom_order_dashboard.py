from odoo import fields, models, api
from datetime import datetime
from dateutil import parser

SO_STATE = [
    ('draft', "Quotation"),
    ('sent', "Quotation Sent"),
    ('sale', "Sales Order"),
    ('cancel', "Cancelled"),
]

class MyCustomOrderDashboard(models.Model):
    _name = 'my.custom.order.dashboard'

    @api.model
    def get_default_order_date(self):
        return datetime.now().date()

    order_name = fields.Char('Number')
    partner_id = fields.Many2one(
        'res.partner', string='Customer',
        domain="[('is_company', '=', is_company)]"
    )
    state = fields.Selection(
        selection=SO_STATE,
        default='sale'
    )
    order_date = fields.Date(
        'Order Date',
        default=get_default_order_date
    )

    is_company = fields.Boolean(
        'Is Company?', default=False
    )

    @api.onchange('is_company')
    def onchange_is_company(self):
        for rec in self:
            if rec.partner_id and rec.partner_id.is_company != rec.is_company:
                rec.partner_id = False


    ######### API get Data #########
    @api.model
    def get_sale_orders(self, filterVal):
        def convert_filter_data(mapping_filter):
            value = filterVal.get(mapping_filter['key'], '')
            prefix = mapping_filter.get('prefix', '')
            suffix = mapping_filter.get('suffix', '')
            filter_type = mapping_filter.get('type_val', '')
            value = f"{prefix}{value}{suffix}"
            if filter_type == 'date':
                value = f"'{parser.isoparse(value).date()}'"
            elif filter_type == 'char':
                value = f"'{value}'"
            else:
                value = f"{value}"
            return value

        mapping_filters = [
            {
                'key': 'order_name',
                'alias': 'so.name',
                'type_val': 'char',
                'operator': 'ilike',
                'type_cond': 'AND',
                'prefix': '%',
                'suffix': '%'
            },
            {
                'key': 'partner_id',
                'alias': 'so.partner_id',
                'type_val': 'integer',
                'operator': '=',
                'type_cond': 'AND',
            },
            {
                'key': 'order_date',
                'alias': "to_char(so.date_order, 'YYYY-MM-DD')",
                'type_val': 'date',
                'operator': '=',
                'type_cond': 'AND',
            },
            {
                'key': 'state',
                'alias': 'so.state',
                'type_val': 'char',
                'operator': '=',
                'type_cond': 'AND',
            },
        ]

        condition = '\t'.join([
            f"{mf['type_cond']} {mf['alias']} {mf['operator']} {convert_filter_data(mf)}"
            for mf in list(filter(lambda f: filterVal.get(f['key']), mapping_filters))
        ])

        state_select = """
            CASE
                {when_then}
                ELSE
                    ''
            END AS state
        """.format(
            when_then="".join([
                f"\t WHEN so.state = '{stateVal[0]}' then '{stateVal[1]}'"
                for stateVal in SO_STATE
            ])
        )

        sql = """
            SELECT
                so.name AS name,
                so.partner_id AS partner_id,
                to_char(so.date_order, 'DD/MM/YYYY') AS date_order,
                so.amount_total AS amount_total,
                rp_cus.name AS partner_name,
                {state_select}
            FROM
                sale_order so
                JOIN res_partner rp_cus ON rp_cus.id = so.partner_id
            WHERE
                1=1
                {condition}
            ORDER BY
                so.name ASC
        """.format(
            condition=condition,
            state_select=state_select
        )
        self.env.cr.execute(sql)
        return self.env.cr.dictfetchall()
