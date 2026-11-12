(() => {
  const period = document.querySelector("#period");
  const category = document.querySelector("#category");
  const trend = document.querySelector("#trend");
  const panelNavigation = document.querySelectorAll('.main-nav a[href^="#"]');

  function syncPanelNavigation() {
    const section = location.hash || "#visao-geral";
    for (const link of panelNavigation) {
      if (link.hash === section) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    }
  }

  syncPanelNavigation();
  window.addEventListener("hashchange", syncPanelNavigation);

  const money = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
  const moneyCents = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
  const compactNumber = new Intl.NumberFormat("pt-BR", {
    notation: "compact",
    maximumFractionDigits: 1,
  });
  const number = new Intl.NumberFormat("pt-BR");
  const percent = new Intl.NumberFormat("pt-BR", {
    style: "percent",
    maximumFractionDigits: 1,
  });

  const categories = [
    {
      id: "electronics",
      name: "Eletrônicos",
      share: 0.38,
      ticket: 164,
      goalShare: 0.49,
    },
    {
      id: "home",
      name: "Casa e decoração",
      share: 0.34,
      ticket: 110,
      goalShare: 0.32,
    },
    {
      id: "accessories",
      name: "Acessórios",
      share: 0.28,
      ticket: 77,
      goalShare: 0.19,
    },
  ];
  const channels = [
    {
      name: "Loja online",
      share: 0.53,
      factor: 1.04,
      color: "var(--accent)",
    },
    {
      name: "Marketplace",
      share: 0.31,
      factor: 0.96,
      color: "var(--teal)",
    },
    { name: "Venda direta", share: 0.16, factor: 1, color: "var(--lilac)" },
  ];
  const regions = [
    { name: "Sudeste", share: 0.51 },
    { name: "Sul", share: 0.27 },
    { name: "Nordeste", share: 0.22 },
  ];
  const months = [
    { name: "Jan", orders: 310, goal: 34000 },
    { name: "Fev", orders: 360, goal: 36500 },
    { name: "Mar", orders: 340, goal: 39000 },
    { name: "Abr", orders: 430, goal: 42000 },
    { name: "Mai", orders: 414, goal: 44500 },
    { name: "Jun", orders: 475, goal: 47000 },
    { name: "Jul", orders: 495, goal: 54000 },
    { name: "Ago", orders: 455, goal: 56500 },
    { name: "Set", orders: 520, goal: 59000 },
    { name: "Out", orders: 570, goal: 66500 },
    { name: "Nov", orders: 690, goal: 77000 },
    { name: "Dez", orders: 640, goal: 80500 },
  ];

  // Cada linha da base representa vendas agregadas por mês, categoria, canal e região.
  const sales = months.flatMap((month, monthIndex) =>
    categories.flatMap((item, itemIndex) =>
      channels.flatMap((channel, channelIndex) =>
        regions.map((region, regionIndex) => {
          const demand =
            1 + 0.1 * Math.sin(monthIndex + itemIndex * 1.5 + channelIndex);
          const orders = Math.round(
            month.orders * item.share * channel.share * region.share * demand,
          );
          const ticket =
            item.ticket *
            channel.factor *
            (1 + 0.065 * Math.sin(monthIndex * 0.8 + regionIndex + itemIndex));
          return {
            monthIndex,
            category: item.id,
            channelIndex,
            regionIndex,
            orders,
            revenue: Math.round(orders * ticket),
          };
        }),
      ),
    ),
  );

  const sum = (rows, key) => rows.reduce((total, row) => total + row[key], 0);
  const points = (values, x, y) =>
    values.map((value, index) => `${x(index)},${y(value)}`).join(" ");

  function svgElement(tag, attributes, text) {
    const element = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (const [name, value] of Object.entries(attributes)) {
      element.setAttribute(name, value);
    }
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function spark(id, values) {
    const min = Math.min(...values);
    const scale = Math.max(...values) - min || 1;
    const line = points(
      values,
      (index) => 1 + (68 * index) / (values.length - 1),
      (value) => 22 - (20 * (value - min)) / scale,
    );
    document.getElementById(id).replaceChildren(
      svgElement("polyline", {
        points: line,
        fill: "none",
        stroke: "currentColor",
        "stroke-width": 1.7,
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
      }),
    );
  }

  function drawTrend(totals) {
    const width = Math.max(
      230,
      Math.floor(trend.getBoundingClientRect().width),
    );
    const height = 209;
    const left = 43;
    const right = width - 17;
    const baseline = height - 26;
    const maximum = Math.max(
      ...totals.flatMap(({ revenue, goal }) => [revenue, goal]),
    );
    const unit = 10 ** Math.floor(Math.log10(maximum / 4));
    const step =
      [1, 2, 2.5, 5, 10].find((value) => value * unit >= maximum / 4) * unit;
    const top = Math.ceil(maximum / step) * step;
    const x = (index) => left + ((right - left) * index) / (totals.length - 1);
    const y = (value) => baseline - ((baseline - 13) * value) / top;
    const revenue = points(
      totals.map((month) => month.revenue),
      x,
      y,
    );
    const goal = points(
      totals.map((month) => month.goal),
      x,
      y,
    );
    const grid = Array.from({ length: top / step + 1 }, (_, index) => {
      const value = index * step;
      const lineY = y(value);
      return [
        svgElement("line", {
          class: "gridline",
          x1: left,
          x2: right,
          y1: lineY,
          y2: lineY,
        }),
        svgElement(
          "text",
          { class: "axis", x: left - 7, y: lineY + 3, "text-anchor": "end" },
          compactNumber.format(value),
        ),
      ];
    }).flat();
    const labelEvery = Math.ceil(((totals.length - 1) * 35) / (right - left));
    const labels = totals.flatMap((month, index) => {
      const isLast = index === totals.length - 1;
      if (
        !isLast &&
        (index % labelEvery !== 0 ||
          ((totals.length - 1 - index) * (right - left)) / (totals.length - 1) <
            30)
      )
        return [];
      return svgElement(
        "text",
        {
          class: "axis",
          x: x(index),
          y: height - 6,
          "text-anchor": "middle",
        },
        month.name,
      );
    });
    const dots = totals.map((month, index) => {
      const dot = svgElement("circle", {
        class: "dot",
        cx: x(index),
        cy: y(month.revenue),
        r: index === totals.length - 1 ? 4.5 : 3,
      });
      const description = `${month.name} · Receita ${money.format(month.revenue)} · Meta ${money.format(month.goal)}`;
      dot.append(svgElement("title", {}, description));
      return dot;
    });
    trend.setAttribute("viewBox", `0 0 ${width} ${height}`);
    trend.setAttribute(
      "aria-label",
      `Receita e meta de ${totals[0].name} a ${totals.at(-1).name}. Consulte a tabela de dados mensais para os valores exatos.`,
    );
    const gradient = svgElement("linearGradient", {
      id: "trend-area",
      x1: 0,
      x2: 0,
      y1: 0,
      y2: 1,
      gradientUnits: "objectBoundingBox",
    });
    gradient.append(
      svgElement("stop", {
        "stop-color": "var(--accent)",
        "stop-opacity": 0.28,
      }),
      svgElement("stop", {
        offset: 1,
        "stop-color": "var(--accent)",
        "stop-opacity": 0,
      }),
    );
    const definitions = svgElement("defs", {});
    definitions.append(gradient);
    trend.replaceChildren(
      definitions,
      ...grid,
      svgElement("polygon", {
        points: `${left},${baseline} ${revenue} ${right},${baseline}`,
        fill: "url(#trend-area)",
      }),
      svgElement("polyline", {
        class: "goal",
        points: goal,
        fill: "none",
        "stroke-width": 1.8,
      }),
      svgElement("polyline", {
        class: "actual",
        points: revenue,
        fill: "none",
        "stroke-width": 2.7,
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
      }),
      ...dots,
      ...labels,
    );
  }

  function drawChannels(rows, revenue) {
    let start = 0;
    const slices = channels.map((channel, index) => {
      const share =
        sum(
          rows.filter((row) => row.channelIndex === index),
          "revenue",
        ) / revenue;
      const end = start + share * 100;
      const slice = {
        ...channel,
        share,
        arc: `${channel.color} ${start}% ${end}%`,
      };
      start = end;
      return slice;
    });
    document.querySelector("#donut").style.backgroundImage =
      `conic-gradient(${slices.map((slice) => slice.arc).join(", ")})`;
    document.querySelector("#donut-total").textContent =
      compactNumber.format(revenue);
    const channelItems = slices.map((slice) => {
      const item = element("li");
      const swatch = element("span", "swatch");
      swatch.setAttribute("aria-hidden", "true");
      swatch.style.backgroundColor = slice.color;
      item.append(
        swatch,
        element("span", "", slice.name),
        element("strong", "", percent.format(slice.share)),
      );
      return item;
    });
    document.querySelector("#channel-list").replaceChildren(...channelItems);
    return slices.reduce((leader, slice) =>
      slice.share > leader.share ? slice : leader,
    );
  }

  function drawCategories(rows, activeCategories, revenue) {
    const ranking = activeCategories
      .map((item) => ({
        ...item,
        revenue: sum(
          rows.filter((row) => row.category === item.id),
          "revenue",
        ),
      }))
      .sort((a, b) => b.revenue - a.revenue);
    const categoryItems = ranking.map(({ name, revenue: categoryRevenue }) => {
      const item = element("li");
      const caption = element("div", "category-caption");
      caption.append(
        element("span", "", name),
        element("strong", "", money.format(categoryRevenue)),
      );
      const track = element("div", "bar-track");
      track.setAttribute("aria-hidden", "true");
      const fill = element("span", "bar-fill");
      fill.style.width = `${(100 * categoryRevenue) / revenue}%`;
      track.append(fill);
      item.append(caption, track);
      return item;
    });
    document.querySelector("#category-list").replaceChildren(...categoryItems);
  }

  function drawRegions(rows) {
    const counts = regions.map((region, index) =>
      sum(
        rows.filter((row) => row.regionIndex === index),
        "orders",
      ),
    );
    const max = Math.max(...counts);
    const regionItems = regions.map((region, index) => {
      const item = element("li");
      const fill = element("span", "region-fill");
      fill.style.height = `${(90 * counts[index]) / max}px`;
      fill.setAttribute("aria-hidden", "true");
      item.append(
        element("strong", "", number.format(counts[index])),
        fill,
        element("span", "", region.name),
      );
      return item;
    });
    document.querySelector("#region-list").replaceChildren(...regionItems);
  }

  let monthlyTotals;

  function render() {
    const start = months.length - Number(period.value);
    const activeCategories = categories.filter(
      (item) => category.value === "all" || item.id === category.value,
    );
    const rows = sales.filter(
      (row) =>
        row.monthIndex >= start &&
        (category.value === "all" || row.category === category.value),
    );
    const goalShare = sum(activeCategories, "goalShare");
    monthlyTotals = months.slice(start).map((month, index) => {
      const entries = rows.filter((row) => row.monthIndex === start + index);
      return {
        name: month.name,
        revenue: sum(entries, "revenue"),
        orders: sum(entries, "orders"),
        goal: Math.round(month.goal * goalShare),
      };
    });
    const revenue = sum(monthlyTotals, "revenue");
    const orders = sum(monthlyTotals, "orders");
    const goal = sum(monthlyTotals, "goal");
    const goalNote = document.querySelector("#goal-note");
    document.querySelector("#revenue").textContent = money.format(revenue);
    document.querySelector("#orders").textContent = number.format(orders);
    document.querySelector("#ticket").textContent = moneyCents.format(
      revenue / orders,
    );
    document.querySelector("#goal-rate").textContent = percent.format(
      revenue / goal,
    );
    goalNote.textContent =
      revenue >= goal
        ? `${money.format(revenue - goal)} acima da meta`
        : `${money.format(goal - revenue)} para atingir a meta`;
    goalNote.dataset.goal = revenue >= goal ? "above" : "below";
    spark(
      "revenue-spark",
      monthlyTotals.map((month) => month.revenue),
    );
    spark(
      "orders-spark",
      monthlyTotals.map((month) => month.orders),
    );
    spark(
      "ticket-spark",
      monthlyTotals.map((month) => month.revenue / month.orders),
    );
    spark(
      "goal-spark",
      monthlyTotals.map((month) => month.revenue / month.goal),
    );
    drawTrend(monthlyTotals);
    const topChannel = drawChannels(rows, revenue);
    drawCategories(rows, activeCategories, revenue);
    drawRegions(rows);
    const peak = monthlyTotals.reduce((best, month) =>
      month.revenue > best.revenue ? month : best,
    );
    document.querySelector("#insight").textContent =
      `${peak.name}/2025 foi o mês com maior receita (${money.format(peak.revenue)}). ${topChannel.name} respondeu por ${percent.format(topChannel.share)} das vendas do recorte.`;
    const tableRows = monthlyTotals.map((month) => {
      const row = element("tr");
      const heading = element("th", "", `${month.name}/2025`);
      heading.scope = "row";
      row.append(
        heading,
        element("td", "", money.format(month.revenue)),
        element("td", "", money.format(month.goal)),
        element("td", "", number.format(month.orders)),
      );
      return row;
    });
    document.querySelector("#monthly-data").replaceChildren(...tableRows);
  }

  period.addEventListener("change", render);
  category.addEventListener("change", render);
  render();
  // Recalcula os eixos para manter os rótulos legíveis nas telas menores.
  if ("ResizeObserver" in window)
    new ResizeObserver(() => drawTrend(monthlyTotals)).observe(trend);
})();
