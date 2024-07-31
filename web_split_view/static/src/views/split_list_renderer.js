/** @odoo-module */
import { ListRenderer } from "@web/views/list/list_renderer";
import { useBus } from "@web/core/utils/hooks";

import { SIZE_ADJUST_DELAY } from './split_list_controller'

export class SplitRenderer extends ListRenderer {

    setup() {
        super.setup()
        useBus(this.env.splitViewBus, "freeze-column-widths", async (ev) => {
            setTimeout(()=> {
                this.freezeColumnWidths()
            }, SIZE_ADJUST_DELAY)
        });
    }

    async onCellClicked(record, column, ev) {
        this.props.openRecord(record)
    }

    toggleRecordSelection(record, ev) {
        super.toggleRecordSelection(record, ev)
        this.props.openRecord(record)
    }

    /**
     * Override:
     * Handles the resize feature on the column headers
     *
     * @private
     * @param {MouseEvent} ev
     */
    onStartResize(ev) {
        console.log('onStartResize inherit this', this);

        this.resizing = true;
        const table = this.tableRef.el;
        const th = ev.target.closest("th");
        const handler = th.querySelector(".o_resize");

        // table.style.width = `${Math.floor(table.getBoundingClientRect().width)}px`;

        const thPosition = [...th.parentNode.children].indexOf(th);
        const resizingColumnElements = [...table.getElementsByTagName("tr")]
            .filter((tr) => tr.children.length === th.parentNode.children.length)
            .map((tr) => tr.children[thPosition]);
        const initialX = ev.clientX;
        const initialWidth = th.getBoundingClientRect().width;
        // const initialTableWidth = table.getBoundingClientRect().width;
        const resizeStoppingEvents = ["keydown", "pointerdown", "pointerup"];

        // fix the width so that if the resize overflows, it doesn't affect the layout of the parent
        // if (!this.rootRef.el.style.width) {
        //     this.rootRef.el.style.width = `${Math.floor(
        //         this.rootRef.el.getBoundingClientRect().width
        //     )}px`;
        // }

        // Apply classes to table and selected column
        table.classList.add("o_resizing");
        for (const el of resizingColumnElements) {
            el.classList.add("o_column_resizing");
            handler.classList.add("bg-primary", "opacity-100");
            handler.classList.remove("bg-black-25", "opacity-50-hover");
        }
        // Mousemove event : resize header
        const resizeHeader = (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            const delta = ev.clientX - initialX;
            const newWidth = Math.max(10, initialWidth + delta);
            // const tableDelta = newWidth - initialWidth;
            th.style.width = `${Math.floor(newWidth)}px`;
            th.style.maxWidth = `${Math.floor(newWidth)}px`;
            // table.style.width = `${Math.floor(initialTableWidth + tableDelta)}px`;
        };
        window.addEventListener("pointermove", resizeHeader);

        // Mouse or keyboard events : stop resize
        const stopResize = (ev) => {
            this.resizing = false;
            // freeze column size after resizing
            this.keepColumnWidths = true;
            // Ignores the 'left mouse button down' event as it used to start resizing
            if (ev.type === "pointerdown" && ev.button === 0) {
                return;
            }
            ev.preventDefault();
            ev.stopPropagation();

            table.classList.remove("o_resizing");
            for (const el of resizingColumnElements) {
                el.classList.remove("o_column_resizing");
                handler.classList.remove("bg-primary", "opacity-100");
                handler.classList.add("bg-black-25", "opacity-50-hover");
            }

            window.removeEventListener("pointermove", resizeHeader);
            for (const eventType of resizeStoppingEvents) {
                window.removeEventListener(eventType, stopResize);
            }

            // we remove the focus to make sure that the there is no focus inside
            // the tr.  If that is the case, there is some css to darken the whole
            // thead, and it looks quite weird with the small css hover effect.
            document.activeElement.blur();
        };
        // We have to listen to several events to properly stop the resizing function. Those are:
        // - pointerdown (e.g. pressing right click)
        // - pointerup : logical flow of the resizing feature (drag & drop)
        // - keydown : (e.g. pressing 'Alt' + 'Tab' or 'Windows' key)
        for (const eventType of resizeStoppingEvents) {
            window.addEventListener(eventType, stopResize);
        }
    }

    getRowClass(record) {
        let classNames = super.getRowClass(record).split(" ")
        const svSelectedCls = "table-info"
        const removeClassList = ['o_selected_row']

        classNames = classNames.filter(cls => !removeClassList.includes(cls))

        if (record.svSelected && !classNames.includes(svSelectedCls)) {
            classNames.push(svSelectedCls)
        }
        return classNames.join(" ")
    }

    getCellClass(column, record) {
        const classNames = super.getCellClass(column, record).split(" ")
        const svCellClass = 'cursor-pointer'

        if (!classNames.includes(svCellClass)) {
            classNames.push(svCellClass)
        }

        if (classNames.includes('text-muted')){
            classNames.splice(classNames.indexOf('text-muted'), 1)
        }
        return classNames.join(" ")
    }
}

SplitRenderer.components = {
    ...ListRenderer.components,
};
