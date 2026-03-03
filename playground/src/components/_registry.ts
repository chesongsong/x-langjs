import { createApp } from "vue";
import { defineComponent } from "@x-lang/core";
import type { ComponentDefinition } from "@x-lang/core";
import type { SkeletonContext } from "@x-lang/core";
import { defineVueComponent } from "./_define-vue-component.js";
import {
  buttonSetup,
  alertSetup,
  progressSetup,
  tagSetup,
  statisticSetup,
  descriptionsSetup,
  resultSetup,
  rateSetup,
  cardSetup,
  orderCardSetup,
  hotelConfirmSetup,
  tableSetup,
  formSetup,
  drawerSetup,
  timelineSetup,
  collapseSetup,
  dialogSetup,
  linechartSetup,
  areachartSetup,
  barchartSetup,
  piechartSetup,
  scatterchartSetup,
  candlestickchartSetup,
  radarchartSetup,
  graphchartSetup,
  type RenderTableData,
} from "./_setups.js";
import ChartView from "./common/ChartView.vue";

import ElementButtonView from "./element/ButtonView.vue";
import ElementAlertView from "./element/AlertView.vue";
import ElementTableView from "./element/TableView.vue";
import ElementProgressView from "./element/ProgressView.vue";
import ElementTagView from "./element/TagView.vue";
import ElementStatisticView from "./element/StatisticView.vue";
import ElementDescriptionsView from "./element/DescriptionsView.vue";
import ElementResultView from "./element/ResultView.vue";
import ElementRateView from "./element/RateView.vue";
import ElementCardView from "./element/CardView.vue";
import ElementOrderCardView from "./element/OrderCardView.vue";
import ElementHotelConfirmView from "./element/HotelConfirmView.vue";
import ElementFormView from "./element/FormView.vue";
import ElementDrawerView from "./element/DrawerView.vue";
import ElementTimelineView from "./element/TimelineView.vue";
import ElementCollapseView from "./element/CollapseView.vue";
import ElementDialogView from "./element/DialogView.vue";

import ArcoButtonView from "./arco/ButtonView.vue";
import ArcoAlertView from "./arco/AlertView.vue";
import ArcoTableView from "./arco/TableView.vue";
import ArcoProgressView from "./arco/ProgressView.vue";
import ArcoTagView from "./arco/TagView.vue";
import ArcoStatisticView from "./arco/StatisticView.vue";
import ArcoDescriptionsView from "./arco/DescriptionsView.vue";
import ArcoResultView from "./arco/ResultView.vue";
import ArcoRateView from "./arco/RateView.vue";
import ArcoCardView from "./arco/CardView.vue";
import ArcoOrderCardView from "./arco/OrderCardView.vue";
import ArcoHotelConfirmView from "./arco/HotelConfirmView.vue";
import ArcoFormView from "./arco/FormView.vue";
import ArcoDrawerView from "./arco/DrawerView.vue";
import ArcoTimelineView from "./arco/TimelineView.vue";
import ArcoCollapseView from "./arco/CollapseView.vue";
import ArcoDialogView from "./arco/DialogView.vue";

import AntdButtonView from "./antd/ButtonView.vue";
import AntdAlertView from "./antd/AlertView.vue";
import AntdTableView from "./antd/TableView.vue";
import AntdProgressView from "./antd/ProgressView.vue";
import AntdTagView from "./antd/TagView.vue";
import AntdStatisticView from "./antd/StatisticView.vue";
import AntdDescriptionsView from "./antd/DescriptionsView.vue";
import AntdResultView from "./antd/ResultView.vue";
import AntdRateView from "./antd/RateView.vue";
import AntdCardView from "./antd/CardView.vue";
import AntdOrderCardView from "./antd/OrderCardView.vue";
import AntdHotelConfirmView from "./antd/HotelConfirmView.vue";
import AntdFormView from "./antd/FormView.vue";
import AntdDrawerView from "./antd/DrawerView.vue";
import AntdTimelineView from "./antd/TimelineView.vue";
import AntdCollapseView from "./antd/CollapseView.vue";
import AntdDialogView from "./antd/DialogView.vue";

import ButtonSkeleton from "./skeletons/ButtonSkeleton.vue";
import AlertSkeleton from "./skeletons/AlertSkeleton.vue";
import TableSkeleton from "./skeletons/TableSkeleton.vue";
import ProgressSkeleton from "./skeletons/ProgressSkeleton.vue";
import TagSkeleton from "./skeletons/TagSkeleton.vue";
import StatisticSkeleton from "./skeletons/StatisticSkeleton.vue";
import DescriptionsSkeleton from "./skeletons/DescriptionsSkeleton.vue";
import ResultSkeleton from "./skeletons/ResultSkeleton.vue";
import RateSkeleton from "./skeletons/RateSkeleton.vue";
import CardSkeleton from "./skeletons/CardSkeleton.vue";
import OrderCardSkeleton from "./skeletons/OrderCardSkeleton.vue";

export type UILib = "element" | "arco" | "antd";

interface ViewMap {
  button: typeof ElementButtonView;
  alert: typeof ElementAlertView;
  table: typeof ElementTableView;
  progress: typeof ElementProgressView;
  tag: typeof ElementTagView;
  statistic: typeof ElementStatisticView;
  descriptions: typeof ElementDescriptionsView;
  result: typeof ElementResultView;
  rate: typeof ElementRateView;
  card: typeof ElementCardView;
  orderCard: typeof ElementOrderCardView;
  hotelConfirm: typeof ElementHotelConfirmView;
  form: typeof ElementFormView;
  drawer: typeof ElementDrawerView;
  timeline: typeof ElementTimelineView;
  collapse: typeof ElementCollapseView;
  dialog: typeof ElementDialogView;
}

const elementViews: ViewMap = {
  button: ElementButtonView,
  alert: ElementAlertView,
  table: ElementTableView,
  progress: ElementProgressView,
  tag: ElementTagView,
  statistic: ElementStatisticView,
  descriptions: ElementDescriptionsView,
  result: ElementResultView,
  rate: ElementRateView,
  card: ElementCardView,
  orderCard: ElementOrderCardView,
  hotelConfirm: ElementHotelConfirmView,
  form: ElementFormView,
  drawer: ElementDrawerView,
  timeline: ElementTimelineView,
  collapse: ElementCollapseView,
  dialog: ElementDialogView,
};

const arcoViews: ViewMap = {
  button: ArcoButtonView,
  alert: ArcoAlertView,
  table: ArcoTableView,
  progress: ArcoProgressView,
  tag: ArcoTagView,
  statistic: ArcoStatisticView,
  descriptions: ArcoDescriptionsView,
  result: ArcoResultView,
  rate: ArcoRateView,
  card: ArcoCardView,
  orderCard: ArcoOrderCardView,
  hotelConfirm: ArcoHotelConfirmView,
  form: ArcoFormView,
  drawer: ArcoDrawerView,
  timeline: ArcoTimelineView,
  collapse: ArcoCollapseView,
  dialog: ArcoDialogView,
};

const antdViews: ViewMap = {
  button: AntdButtonView,
  alert: AntdAlertView,
  table: AntdTableView,
  progress: AntdProgressView,
  tag: AntdTagView,
  statistic: AntdStatisticView,
  descriptions: AntdDescriptionsView,
  result: AntdResultView,
  rate: AntdRateView,
  card: AntdCardView,
  orderCard: AntdOrderCardView,
  hotelConfirm: AntdHotelConfirmView,
  form: AntdFormView,
  drawer: AntdDrawerView,
  timeline: AntdTimelineView,
  collapse: AntdCollapseView,
  dialog: AntdDialogView,
};

const viewMap: Record<UILib, ViewMap> = {
  element: elementViews,
  arco: arcoViews,
  antd: antdViews,
};

const skeletonMap = {
  button: ButtonSkeleton,
  alert: AlertSkeleton,
  table: TableSkeleton,
  progress: ProgressSkeleton,
  tag: TagSkeleton,
  statistic: StatisticSkeleton,
  descriptions: DescriptionsSkeleton,
  result: ResultSkeleton,
  rate: RateSkeleton,
  card: CardSkeleton,
  orderCard: OrderCardSkeleton,
};

function createTableDef(
  tableView: ViewMap["table"],
  tableSkeleton: typeof TableSkeleton,
): ComponentDefinition<RenderTableData> {
  return defineComponent<RenderTableData>("table", {
    setup: tableSetup,
    render(data, container) {
      const mountEl = document.createElement("div");
      container.appendChild(mountEl);
      const vueApp = createApp(tableView, { columns: data.columns });
      vueApp.mount(mountEl);
      return {
        dispose() {
          vueApp.unmount();
          mountEl.remove();
        },
      };
    },
    skeleton(container: HTMLElement, ctx: SkeletonContext) {
      const mountEl = document.createElement("div");
      container.appendChild(mountEl);
      const vueApp = createApp(tableSkeleton, {
        content: ctx.content,
        variables: ctx.variables,
      });
      vueApp.mount(mountEl);
      return {
        dispose() {
          vueApp.unmount();
          mountEl.remove();
        },
      };
    },
  });
}

export function createComponents(lib: UILib): ComponentDefinition[] {
  const views = viewMap[lib];
  return [
    defineVueComponent("button", {
      setup: buttonSetup,
      component: views.button,
      skeleton: skeletonMap.button,
    }),
    defineVueComponent("alert", {
      setup: alertSetup,
      component: views.alert,
      skeleton: skeletonMap.alert,
    }),
    defineVueComponent("progress", {
      setup: progressSetup,
      component: views.progress,
      skeleton: skeletonMap.progress,
    }),
    defineVueComponent("tag", {
      setup: tagSetup,
      component: views.tag,
      skeleton: skeletonMap.tag,
    }),
    defineVueComponent("statistic", {
      setup: statisticSetup,
      component: views.statistic,
      skeleton: skeletonMap.statistic,
    }),
    defineVueComponent("descriptions", {
      setup: descriptionsSetup,
      component: views.descriptions,
      skeleton: skeletonMap.descriptions,
    }),
    defineVueComponent("result", {
      setup: resultSetup,
      component: views.result,
      skeleton: skeletonMap.result,
    }),
    defineVueComponent("rate", {
      setup: rateSetup,
      component: views.rate,
      skeleton: skeletonMap.rate,
    }),
    defineVueComponent("card", {
      setup: cardSetup,
      component: views.card,
      skeleton: skeletonMap.card,
    }),
    defineVueComponent("ordercard", {
      setup: orderCardSetup,
      component: views.orderCard,
      skeleton: skeletonMap.orderCard,
    }),
    defineVueComponent("hotelconfirm", {
      setup: hotelConfirmSetup,
      component: views.hotelConfirm,
    }),
    defineVueComponent("form", {
      setup: formSetup,
      component: views.form,
    }),
    defineVueComponent("drawer", {
      setup: drawerSetup,
      component: views.drawer,
    }),
    defineVueComponent("timeline", {
      setup: timelineSetup,
      component: views.timeline,
    }),
    defineVueComponent("collapse", {
      setup: collapseSetup,
      component: views.collapse,
    }),
    defineVueComponent("dialog", {
      setup: dialogSetup,
      component: views.dialog,
    }),
    defineVueComponent("linechart", {
      setup: linechartSetup,
      component: ChartView,
    }),
    defineVueComponent("areachart", {
      setup: areachartSetup,
      component: ChartView,
    }),
    defineVueComponent("barchart", {
      setup: barchartSetup,
      component: ChartView,
    }),
    defineVueComponent("piechart", {
      setup: piechartSetup,
      component: ChartView,
    }),
    defineVueComponent("scatterchart", {
      setup: scatterchartSetup,
      component: ChartView,
    }),
    defineVueComponent("candlestickchart", {
      setup: candlestickchartSetup,
      component: ChartView,
    }),
    defineVueComponent("radarchart", {
      setup: radarchartSetup,
      component: ChartView,
    }),
    defineVueComponent("graphchart", {
      setup: graphchartSetup,
      component: ChartView,
    }),
    createTableDef(views.table, skeletonMap.table),
  ];
}
