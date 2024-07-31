/** @odoo-module */
import { browser } from "@web/core/browser/browser";
import { ListController} from '@web/views/list/list_controller';
import { onMounted, onWillUnmount, useSubEnv, EventBus, useEffect, useRef, useExternalListener } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";

import { FormViewWrapper } from './form_view_wrapper'
import { SIZES, MEDIAS_BREAKPOINTS } from "@web/core/ui/ui_service";

export const SIZE_ADJUST_DELAY = 300

export class SplitListController extends ListController {
    setup() {
        super.setup()
        this.splitViewService = useService('split_view_service')

        this.splitterRef = useRef("splitter")
        this.splitWrapperRef = useRef("split_wrapper")

        this.splitListRef = useRef("split_list")
        this.splitFormRef = useRef("split_form")

        this.splitterCollapseLeftRef = useRef("splitter_collapse_left")
        this.splitterCollapseRightRef = useRef("splitter_collapse_right")

        this.isResizing = false
        this.lastDownX = 0
        this.isFormFull = false

        useEffect(() => {
            let defaultResId = false
            if (this.splitViewService.lastResId) {
                defaultResId = this.splitViewService.lastResId
            }
            else if (this.firstLoad && (this.model.root.records || []).length > 0) {
                defaultResId = this.model.root.records[0].resId
            }
            if (defaultResId && this.isViewBig) {
                let defaultRecord = this.model.root.records.find(r => r.resId === defaultResId)
                if (Object.keys(defaultRecord || {}).length > 0) {
                    this.openRecord(defaultRecord)
                }
            }
        })

        useSubEnv({
            splitViewBus: new EventBus(),
            getForceSplitFormArch: () => this.getForceSplitFormArch()
        })

        onMounted(() => {
            this._onResizeWindow()
            window.addEventListener("mousemove", (ev) => this.onMountMove(ev));
            window.addEventListener("mouseup", (ev) => this.onMountUp(ev));

            this.setDefaultSplitSize()

            setTimeout(()=> {
                this.adjustChatter()
            }, SIZE_ADJUST_DELAY)

            if (this.firstLoad) {
                this.env.splitViewBus.trigger("freeze-column-widths")
            }
        })

        onWillUnmount(() => {
            window.removeEventListener("mousemove", (ev) => this.onMountMove(ev));
            window.removeEventListener("mouseup", (ev) => this.onMountUp(ev));
        });

        useExternalListener(window, "resize", () => {
            this._onResizeWindow()
        });

    }

    get isViewBig() {
        return !this.env.isSmall
    }

    getForceSplitFormArch() {
        return this.props.formArchInfo
    }

    setDefaultSplitSize() {
        let splitSize = JSON.parse(browser.localStorage.getItem('splitSize')  || '{}')
        if (
            Object.keys(splitSize).length > 0
            && splitSize[this.env.config.viewId] !== undefined
        ) {
            this._setSizeSplitLeft(splitSize[this.env.config.viewId])
        }
    }

    async saveSplitSizeToLocalStorage(size) {
        let splitSize = JSON.parse((browser.localStorage.getItem('splitSize') || '{}'))
        splitSize[this.env.config.viewId] = size
        browser.localStorage.setItem('splitSize', JSON.stringify(splitSize))
    }

    onClickSplitterCollapseLeft() {
        this.isFormFull = true
        this._setSizeSplitLeft(0)
        this.adjustChatter()
    }

    onClickSplitterCollapseRight(ev) {
        this.isFormFull = false
        if (this.splitListRef.el.style.flex === "unset") {
            this.splitListRef.el.style.flex = "3 1 0%";
        }
        this.setChatterPosition('under')
    }

    onMountDownSplitter(ev) {
        this.isResizing = true
        this.lastDownX = ev.clientX
    }

    _setSizeSplitLeft(size) {
        this.splitListRef.el.style.flex = "unset";
        let sizeVal = size
        if (!isNaN(size)) {
            sizeVal = `${sizeVal}px`
        }
        this.splitListRef.el.style.width = sizeVal
    }

    _setDisplaySplitter(display) {
        let leftDisplay = display
        if (this.isFormFull) {
            leftDisplay = 'none'
        }
        this.splitterCollapseLeftRef.el.style.display = leftDisplay
        this.splitterCollapseRightRef.el.style.display = display
    }

    onMountOverSplitter() {
        this._setDisplaySplitter('block')
    }

    onMountOutSplitter() {
        this._setDisplaySplitter('none')
    }

    onMountUp() {
        this.isResizing = false
    }

    matchMedia(size, min, max) {
        return min <= size && size <= max
    }

    getMediaSize(width) {
        let index = 1
        let size = 1
        for (let value of MEDIAS_BREAKPOINTS) {
            let minCheck = value.minWidth
            let maxCheck = value.maxWidth
            if (!value.maxWidth) {
                maxCheck = 9999999
            }
            if (!value.minWidth) {
                minCheck = 0
            }
            if (this.matchMedia(width, minCheck, maxCheck)) {
                size = index
                break
            }
            index ++
        };
        return size
    }

    onMountMove(ev) {
        if (!this.isResizing)
            return;
        var offsetLeft = ev.clientX
        this._setSizeSplitLeft(offsetLeft)
        this.saveSplitSizeToLocalStorage(offsetLeft)

        // Adjust chatter position on Form View
        this.adjustChatter()
    }

    adjustChatter() {
        const formWidth = this.splitFormRef.el.getBoundingClientRect().width

        const size = this.getMediaSize(formWidth)

        if (size >= SIZES.XXL) {
            this.setChatterPosition('right')
        }
        else {
            this.setChatterPosition('under')
        }
    }

    setChatterPosition(position) {
        const $chatter = $(this.splitFormRef.el).find('div.o-mail-Form-chatter')
        const $formRenderer = $(this.splitFormRef.el).find('div.o_form_renderer')
        $formRenderer.removeClass('d-flex')
        switch (position) {
            case 'right':
                $formRenderer.css({'display': 'flex'})
                $chatter.css({'width': '530px'})
                break
            case 'under':
                $formRenderer.css({'display': 'block'})
                $chatter.css({'width': '100%'})
                break
            default: throw new Error('Unknown position ' + position);
        }
    }

    _onResizeWindow() {
        const tolerance = 8
        const control_panel_height = $('.o_split_view > .o_control_panel').outerHeight()
        const web_navbar_height = $('.o_web_client > .o_navbar').outerHeight()
        const windowHeight = $(window).height()
        const height = windowHeight - control_panel_height - web_navbar_height - tolerance
        
        if (this.isViewBig) {
            this.splitFormRef.el.style.height = `${height}px`
            this.splitFormRef.el.style.display = 'block'
            this.splitterRef.el.style.display = 'block'
        }
        else {
            this._setSizeSplitLeft('100%')
            this.splitFormRef.el.style.display = 'none'
            this.splitterRef.el.style.display = 'none'
        }
        this.splitListRef.el.style.height = `${height}px`
    }

    async openRecord(record) {
        if (this.isViewBig) {
            this.resetSelectedRecords()
            this.triggerReloadSplitForm(record.resId)
            this.splitViewService._updateLastResId(record.resId)
            record.svSelected = true
        }
        else {
            await super.openRecord(...arguments)
        }
    }

    triggerReloadSplitForm(resId) {
        this.env.splitViewBus.trigger("reload-split-form", {
            resId: resId,
            resModel: this.model.root.resModel,
        })
    }

    resetSelectedRecords() {
        this.model.root.records.forEach(record => {
            record.svSelected = false
        })
    }

    reloadSplitListRecords(resId, isAfterCreate, isAfterDelete) {
        if (isAfterDelete) {
            resId = false
        }
        if (resId) {
            this.model.load().then(() => {
                let newSelectedRec = this.model.root.records.find(
                    x => x.resId === resId)
                if (newSelectedRec) {
                    this.openRecord(newSelectedRec)
                }
            });
        }
        else {
            this.resetSelectedRecords()
            if (!isAfterCreate) {
                this.triggerReloadSplitForm(false)
                this.model.load().then(() => {
                    if ((this.model.root.records || []).length > 0) {
                        this.openRecord(this.model.root.records[0])
                    }
                })
            }
        }
    }

}
SplitListController.components = {
    ...SplitListController.components,
    FormViewWrapper
}
SplitListController.props = {
    ...ListController.props,
    formViewId: {type: Number, optional: true},
    treeViewId: {type: Number, optional: true},
    formArchInfo: {type: Object, optional: true}
}
SplitListController.template = "split.View";
