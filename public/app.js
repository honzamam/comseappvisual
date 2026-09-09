const shops = {
  all: {
    name: "Vsechny e-shopy",
    domain: "2 pripojene e-shopy",
    status: "Souhrn",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Souhrn zobrazuje zakladni prehled vsech e-shopu pripojenych k firme.",
  },
  store: {
    name: "Eshop 1",
    domain: "eshop-1.cz",
    status: "Online",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc dictum nisl sed sem placerat, vitae posuere lorem finibus.",
  },
  outlet: {
    name: "Eshop 2",
    domain: "eshop-2.cz",
    status: "Priprava",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec pulvinar ipsum eu massa rutrum, vel aliquam lacus rhoncus.",
  },
};

const overviewData = {
  marketing: {
    title: "Marketingový přehled",
    revenue: "84 250 Kč",
    revenueChange: "+12 % oproti minulému období",
    orders: "128",
    ordersNote: "všechny objednávky",
    customers: "1 482",
    returningCustomers: "z toho vracející se 326",
    averageOrder: "658 Kč",
    discounts: "12 450 Kč",
    discountShare: "14,8 % z tržeb",
    grossProfit: "33 700 Kč",
    profitAfterAds: "21 000 Kč",
    profitNote: "orientační výsledek po započtení reklamních výdajů",
    adRevenueShare: "19,2 %",
    totalAds: "54 700 Kč · PNO 19,2 %",
  },
  finance: {
    title: "Finanční přehled",
    revenue: "76 900 Kč",
    revenueChange: "+8 % oproti minulému období",
    orders: "96",
    ordersNote: "jen zaplacené a vyřízené objednávky",
    customers: "1 126",
    returningCustomers: "z toho vracející se 284",
    averageOrder: "801 Kč",
    discounts: "8 950 Kč",
    discountShare: "11,6 % z tržeb",
    grossProfit: "38 450 Kč",
    profitAfterAds: "15 250 Kč",
    profitNote: "finance počítají jen objednávky ve stavech Zaplacená a Vyřízená",
    adRevenueShare: "16,8 %",
    totalAds: "47 200 Kč · PNO 16,8 %",
  },
};

const setActiveToggle = (button, enabledClass = "text-indigo-700", disabledClass = "text-slate-700") => {
  const group = button.closest("[data-toggle-group]");
  const isEnabled = button.textContent.trim() === "Zapnout";

  group.classList.toggle("bg-indigo-50", isEnabled);
  group.classList.toggle("bg-slate-100", !isEnabled);

  group.querySelectorAll("button").forEach((groupButton) => {
    groupButton.classList.remove("bg-white", enabledClass, disabledClass, "shadow-sm");
    groupButton.classList.add("text-slate-500");
  });

  button.classList.add("bg-white", "shadow-sm");
  button.classList.remove("text-slate-500");
  button.classList.add(isEnabled ? enabledClass : disabledClass);
};

const formatDateInput = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getDateRangeForPreset = (preset) => {
  const today = new Date();
  const start = new Date(today);
  const end = new Date(today);

  if (preset === "yesterday") {
    start.setDate(today.getDate() - 1);
    end.setDate(today.getDate() - 1);

    return {
      end,
      label: "Včera",
      start,
    };
  }

  const days = Number(preset) || 7;
  start.setDate(today.getDate() - days + 1);

  return {
    end,
    label: `Posledních ${days} dní`,
    start,
  };
};

const setPresetDateRange = (preset, dateFrom, dateTo) => {
  const range = getDateRangeForPreset(preset);

  if (dateFrom) {
    dateFrom.value = formatDateInput(range.start);
  }

  if (dateTo) {
    dateTo.value = formatDateInput(range.end);
  }

  return range.label;
};

const initLogin = () => {
  const loginForm = document.querySelector("#login-form");
  const snapshot = document.querySelector("#snapshot");
  const statusText = document.querySelector("#status-text");
  const loginMessage = document.querySelector("#login-message");
  const email = document.querySelector("#email");
  const password = document.querySelector("#password");

  const activateDashboard = (text) => {
    snapshot?.classList.add("active");

    if (statusText) {
      statusText.textContent = text;
    }
  };

  document.querySelectorAll("[data-count]").forEach((element) => {
    const target = Number(element.dataset.count);
    const format = element.dataset.format;
    let current = 0;
    const steps = 36;
    const increment = target / steps;

    const timer = setInterval(() => {
      current += increment;

      if (current >= target) {
        current = target;
        clearInterval(timer);
      }

      if (format === "money") {
        element.textContent = `${Math.round(current).toLocaleString("cs-CZ")} Kc`;
      } else if (format === "percent") {
        element.textContent = `${current.toFixed(1).replace(".", ",")} %`;
      } else if (format === "roas") {
        element.textContent = `${current.toFixed(1).replace(".", ",")}x`;
      } else {
        element.textContent = String(Math.round(current));
      }
    }, 24);
  });

  email?.addEventListener("focus", () => {
    activateDashboard("pripravuji data");
  });

  password?.addEventListener("focus", () => {
    activateDashboard("kontroluji pristup");
  });

  loginForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    activateDashboard("nacitam dashboard");

    if (loginMessage) {
      loginMessage.textContent = "Nacitam vykon e-shopu...";
    }

    window.setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 450);
  });
};

const initSidebar = () => {
  const sidebar = document.querySelector("aside");
  const sidebarShell = sidebar?.closest("main");

  if (!sidebar || !sidebarShell) {
    return;
  }

  if (sidebar.classList.contains("analytics-sidebar")) {
    return;
  }

  sidebar.dataset.sidebar = "";
  sidebarShell.dataset.sidebarShell = "";

  const brandLink = sidebar.querySelector('a[href="dashboard.html"]');
  const brandLabel = brandLink?.querySelector("span:last-child");
  const shopPicker = sidebar.querySelector("#eshop-select")?.closest("div");
  const navigation = sidebar.querySelector("nav");
  const baseLinks = sidebar.querySelector("nav + div");

  navigation?.querySelectorAll("a").forEach((link) => {
    if (link.textContent.trim() === "Firmy") {
      link.href = "performance-xml.html";
      link.textContent = "Výkonnostní XML";
    }
  });

  brandLabel?.setAttribute("data-sidebar-collapsible", "");
  shopPicker?.setAttribute("data-sidebar-collapsible", "");
  navigation?.setAttribute("data-sidebar-collapsible", "");
  baseLinks?.setAttribute("data-sidebar-collapsible", "");

  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.dataset.sidebarToggle = "";
  toggle.className =
    "mt-5 hidden w-full items-center justify-center rounded-lg border border-indigo-100 bg-white px-3 py-2 text-sm font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-50 lg:inline-flex";
  toggle.setAttribute("aria-controls", "sidebar-menu");

  const toggleLabel = document.createElement("span");
  toggleLabel.dataset.sidebarToggleLabel = "";
  toggle.append(toggleLabel);
  brandLink?.after(toggle);

  navigation?.setAttribute("id", "sidebar-menu");

  const setCollapsed = (isCollapsed) => {
    document.body.classList.toggle("sidebar-collapsed", isCollapsed);
    toggle.setAttribute("aria-expanded", String(!isCollapsed));
    toggle.setAttribute("aria-label", isCollapsed ? "Rozbalit bocni menu" : "Minimalizovat bocni menu");
    toggleLabel.textContent = isCollapsed ? ">" : "<";
    localStorage.setItem("comseSidebarCollapsed", isCollapsed ? "1" : "0");
  };

  setCollapsed(localStorage.getItem("comseSidebarCollapsed") === "1");

  toggle.addEventListener("click", () => {
    setCollapsed(!document.body.classList.contains("sidebar-collapsed"));
  });
};

const initShopSelect = () => {
  const eshopSelect = document.querySelector("#eshop-select");
  const selectedShopNames = document.querySelectorAll("[data-selected-shop-name]");
  const selectedShopCardName = document.querySelector("[data-selected-shop-card-name]");
  const selectedShopDomain = document.querySelector("[data-selected-shop-domain]");
  const selectedShopStatus = document.querySelector("[data-selected-shop-status]");
  const selectedShopDescription = document.querySelector("[data-selected-shop-description]");
  const navigation = document.querySelector("aside nav");
  const baseLinks = navigation?.nextElementSibling;

  if (!eshopSelect) {
    return;
  }

  const setMenuScope = (shopKey) => {
    const isCompanyOverview = shopKey === "all";

    if (navigation?.closest(".analytics-sidebar")) {
      return;
    }

    navigation?.querySelectorAll("a").forEach((link) => {
      const href = link.getAttribute("href") || "";
      const isAllowedInOverview = href === "dashboard.html" || href === "settings.html";

      link.hidden = isCompanyOverview && !isAllowedInOverview;
    });

    if (baseLinks) {
      baseLinks.hidden = isCompanyOverview;
    }
  };

  const setSelectedShop = (shopKey) => {
    const safeShopKey = shops[shopKey] ? shopKey : "all";
    const shop = shops[safeShopKey];

    eshopSelect.value = safeShopKey;
    selectedShopNames.forEach((selectedShopName) => {
      selectedShopName.textContent = shop.name;
    });
    if (selectedShopCardName) selectedShopCardName.textContent = shop.name;
    if (selectedShopDomain) selectedShopDomain.textContent = shop.domain;
    if (selectedShopStatus) selectedShopStatus.textContent = shop.status;
    if (selectedShopDescription) selectedShopDescription.textContent = shop.description;
    setMenuScope(safeShopKey);
  };

  setSelectedShop(localStorage.getItem("comseSelectedShop") || eshopSelect.value);

  eshopSelect.addEventListener("change", () => {
    localStorage.setItem("comseSelectedShop", eshopSelect.value);
    setSelectedShop(eshopSelect.value);
  });
};

const initOverviewTabs = () => {
  const overviewTitle = document.querySelector("[data-overview-title]");
  const overviewTabButtons = document.querySelectorAll("[data-overview-tab]");
  const overviewMetrics = document.querySelectorAll("[data-metric]");

  overviewTabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const data = overviewData[button.dataset.overviewTab];

      overviewTabButtons.forEach((tab) => {
        tab.classList.remove("bg-white", "text-indigo-700", "shadow-sm");
        tab.classList.remove("is-active");
        tab.classList.add("text-slate-600");
      });

      button.classList.add("bg-white", "text-indigo-700", "shadow-sm");
      button.classList.add("is-active");
      button.classList.remove("text-slate-600");
      overviewTitle.textContent = data.title;

      overviewMetrics.forEach((metric) => {
        metric.textContent = data[metric.dataset.metric];
      });
    });
  });
};

const initPeriodFilter = () => {
  const periodLabel = document.querySelector("[data-period-label]");
  const periodPresetButtons = document.querySelectorAll("[data-period-preset]");
  const dateFrom = document.querySelector("#date-from");
  const dateTo = document.querySelector("#date-to");

  const setActivePeriodButton = (activeButton) => {
    periodPresetButtons.forEach((button) => {
      button.classList.remove("bg-white", "text-indigo-700", "shadow-sm");
      button.classList.remove("is-active");
      button.classList.add("text-slate-600");
    });

    activeButton?.classList.add("bg-white", "text-indigo-700", "shadow-sm");
    activeButton?.classList.add("is-active");
    activeButton?.classList.remove("text-slate-600");
  };

  periodPresetButtons.forEach((button) => {
    button.addEventListener("click", () => {
      periodLabel.textContent = setPresetDateRange(button.dataset.periodPreset, dateFrom, dateTo);
      setActivePeriodButton(button);
    });
  });

  const updateCustomPeriod = () => {
    if (!dateFrom?.value && !dateTo?.value) {
      return;
    }

    periodLabel.textContent = `${dateFrom.value || "nezadáno"} - ${dateTo.value || "nezadáno"}`;
    setActivePeriodButton(null);
  };

  dateFrom?.addEventListener("change", updateCustomPeriod);
  dateTo?.addEventListener("change", updateCustomPeriod);

  const initialButton = Array.from(periodPresetButtons).find((button) => button.classList.contains("is-active"));

  if (initialButton) {
    periodLabel.textContent = setPresetDateRange(initialButton.dataset.periodPreset, dateFrom, dateTo);
    setActivePeriodButton(initialButton);
  }
};

const initStatusToggles = () => {
  document.querySelectorAll("[data-toggle-group]").forEach((group) => {
    group.addEventListener("click", (event) => {
      const button = event.target.closest("button");

      if (button) {
        setActiveToggle(button);
      }
    });
  });
};

const initAdsFilter = () => {
  const filterButtons = document.querySelectorAll("[data-ads-filter]");
  const rows = document.querySelectorAll("[data-ad-row]");
  const label = document.querySelector("[data-ads-filter-label]");

  const setFilter = (filter) => {
    rows.forEach((row) => {
      row.classList.toggle("hidden", filter === "active" && row.dataset.adStatus !== "active");
    });

    filterButtons.forEach((button) => {
      const isActive = button.dataset.adsFilter === filter;
      button.classList.toggle("bg-white", isActive);
      button.classList.toggle("text-indigo-700", isActive);
      button.classList.toggle("shadow-sm", isActive);
      button.classList.toggle("text-slate-600", !isActive);
    });

    if (label) {
      label.textContent = filter === "active" ? "Aktivni reklamy" : "Vsechny reklamy";
    }
  };

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => setFilter(button.dataset.adsFilter));
  });

  if (filterButtons.length) {
    setFilter("active");
  }
};

const initAdsPeriodFilter = () => {
  const periodButtons = document.querySelectorAll("[data-ads-period-preset]");
  const dateFrom = document.querySelector("#ads-date-from");
  const dateTo = document.querySelector("#ads-date-to");

  if (!periodButtons.length || !dateFrom || !dateTo) {
    return;
  }

  const setActivePeriodButton = (activeButton) => {
    periodButtons.forEach((button) => {
      const isActive = button === activeButton;

      button.classList.toggle("bg-white", isActive);
      button.classList.toggle("text-indigo-700", isActive);
      button.classList.toggle("shadow-sm", isActive);
      button.classList.toggle("text-slate-600", !isActive);
    });
  };

  periodButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setPresetDateRange(button.dataset.adsPeriodPreset, dateFrom, dateTo);
      setActivePeriodButton(button);
    });
  });

  const initialButton =
    Array.from(periodButtons).find((button) => button.classList.contains("bg-white")) || periodButtons[0];

  setPresetDateRange(initialButton.dataset.adsPeriodPreset, dateFrom, dateTo);
  setActivePeriodButton(initialButton);
};

const initProductAdvancedFilters = () => {
  const filterBlock = document.querySelector("[data-product-advanced-filters]");
  const list = filterBlock?.querySelector("[data-product-filter-list]");
  const addButton = filterBlock?.querySelector("[data-product-filter-add]");
  const count = filterBlock?.querySelector("[data-product-filter-count]");

  if (!filterBlock || !list || !addButton) {
    return;
  }

  const updateCount = () => {
    const rulesCount = list.querySelectorAll("[data-product-filter-rule]").length;

    if (count) {
      count.textContent = `${rulesCount} ${rulesCount === 1 ? "aktivni filtr" : "aktivni filtry"}`;
    }

    list.querySelectorAll("[data-product-filter-remove]").forEach((button) => {
      button.hidden = rulesCount === 1;
    });
  };

  const bindRule = (rule) => {
    const removeButton = rule.querySelector("[data-product-filter-remove]");

    removeButton?.addEventListener("click", () => {
      rule.remove();
      updateCount();
    });
  };

  list.querySelectorAll("[data-product-filter-rule]").forEach(bindRule);

  addButton.addEventListener("click", () => {
    const sourceRule = list.querySelector("[data-product-filter-rule]");
    const newRule = sourceRule?.cloneNode(true);

    if (!newRule) {
      return;
    }

    const field = newRule.querySelector("[data-product-filter-field]");
    const operator = newRule.querySelector("[data-product-filter-operator]");
    const value = newRule.querySelector("[data-product-filter-value]");

    if (field) field.value = "Google Ads zisk";
    if (operator) operator.value = "je vetsi nez";
    if (value) value.value = "10 000 Kc";

    bindRule(newRule);
    list.append(newRule);
    updateCount();
  });

  updateCount();
};

const initNetworkTabs = () => {
  const tabs = document.querySelectorAll("[data-network-tab]");
  const panels = document.querySelectorAll("[data-network-panel]");

  if (!tabs.length) {
    return;
  }

  const setNetwork = (network) => {
    tabs.forEach((tab) => {
      const isActive = tab.dataset.networkTab === network;
      tab.classList.toggle("bg-white", isActive);
      tab.classList.toggle("text-indigo-700", isActive);
      tab.classList.toggle("shadow-sm", isActive);
      tab.classList.toggle("text-slate-600", !isActive);
    });

    panels.forEach((panel) => {
      panel.classList.toggle("hidden", panel.dataset.networkPanel !== network);
    });
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      setNetwork(tab.dataset.networkTab);
      window.history.replaceState(null, "", `#${tab.dataset.networkTab}`);
    });
  });

  const initialNetwork = ["#google", "#sklik"].includes(window.location.hash)
    ? window.location.hash.slice(1)
    : "meta";
  setNetwork(initialNetwork);
};

const initAssignmentModal = () => {
  const modal = document.querySelector("#assignment-modal");
  const openButtons = document.querySelectorAll("[data-assignment-open]");
  const closeButtons = document.querySelectorAll("[data-assignment-close]");
  const typeButtons = document.querySelectorAll("[data-assignment-type]");
  const panels = document.querySelectorAll("[data-assignment-panel]");
  const adName = document.querySelector("[data-assignment-ad-name]");

  if (!modal) {
    return;
  }

  const setType = (type) => {
    typeButtons.forEach((button) => {
      const isActive = button.dataset.assignmentType === type;
      button.classList.toggle("bg-indigo-600", isActive);
      button.classList.toggle("text-white", isActive);
      button.classList.toggle("shadow-sm", isActive);
      button.classList.toggle("border", !isActive);
      button.classList.toggle("border-slate-200", !isActive);
      button.classList.toggle("bg-white", !isActive);
      button.classList.toggle("text-slate-600", !isActive);
    });

    panels.forEach((panel) => {
      panel.classList.toggle("hidden", panel.dataset.assignmentPanel !== type);
    });
  };

  const openModal = (button) => {
    adName.textContent = button.dataset.adName || "Vyberte vazbu pro samostatnou reklamu bez produktoveho feedu.";
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    modal.setAttribute("aria-hidden", "false");
    setType("eshop");
  };

  const closeModal = () => {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    modal.setAttribute("aria-hidden", "true");
  };

  openButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      openModal(button);
    });
  });

  closeButtons.forEach((button) => {
    button.addEventListener("click", closeModal);
  });

  typeButtons.forEach((button) => {
    button.addEventListener("click", () => setType(button.dataset.assignmentType));
  });

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });
};

const initFeedModal = () => {
  const modal = document.querySelector("#feed-modal");
  const openButtons = document.querySelectorAll("[data-feed-modal-open]");
  const closeButtons = document.querySelectorAll("[data-feed-modal-close]");
  const eyebrow = modal?.querySelector("[data-feed-modal-eyebrow]");
  const title = modal?.querySelector("[data-feed-modal-title]");
  const description = modal?.querySelector("[data-feed-modal-description]");

  if (!modal || !openButtons.length) {
    return;
  }

  const openModal = (button) => {
    if (eyebrow && button.dataset.feedModalEyebrow) {
      eyebrow.textContent = button.dataset.feedModalEyebrow;
    }

    if (title && button.dataset.feedModalTitle) {
      title.textContent = button.dataset.feedModalTitle;
    }

    if (description && button.dataset.feedModalDescription) {
      description.textContent = button.dataset.feedModalDescription;
    }

    modal.classList.remove("hidden");
    modal.classList.add("flex");
    modal.setAttribute("aria-hidden", "false");
  };

  const closeModal = () => {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    modal.setAttribute("aria-hidden", "true");
  };

  openButtons.forEach((button) => {
    button.addEventListener("click", () => openModal(button));
  });

  closeButtons.forEach((button) => {
    button.addEventListener("click", closeModal);
  });

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });
};

const initXmlFeedProductsLink = () => {
  document.addEventListener(
    "click",
    (event) => {
      const link = event.target.closest("[data-xml-feed-products-link]");

      if (!link) {
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();
      window.location.assign(link.href);
    },
    true
  );
};

const initImageEditModal = () => {
  const modal = document.querySelector("#image-edit-modal");
  const openButtons = document.querySelectorAll("[data-image-edit-open]");
  const closeButtons = document.querySelectorAll("[data-image-edit-close]");
  const generateButton = modal?.querySelector("[data-comse-ai-generate]");
  const regenerateButton = modal?.querySelector("[data-comse-ai-regenerate]");
  const aiResult = modal?.querySelector("[data-comse-ai-result]");
  const aiImage = modal?.querySelector("[data-comse-ai-image]");
  const title = modal?.querySelector("#image-edit-modal-title");
  const aiImages = [
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=520&h=360&q=80",
    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=520&h=360&q=80",
    "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=520&h=360&q=80",
    "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?auto=format&fit=crop&w=520&h=360&q=80",
  ];
  let aiImageIndex = 0;

  if (!modal || !openButtons.length) {
    return;
  }

  const openModal = (button) => {
    if (title) {
      title.textContent = `Editovat obrazek - ${button.dataset.imageEditProduct || "produkt"}`;
    }

    aiImageIndex = Array.from(openButtons).indexOf(button);
    if (aiResult && generateButton) {
      aiResult.classList.add("hidden");
      generateButton.classList.remove("hidden");
    }

    modal.classList.remove("hidden");
    modal.classList.add("flex");
    modal.setAttribute("aria-hidden", "false");
  };

  const closeModal = () => {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    modal.setAttribute("aria-hidden", "true");
  };

  const showAiResult = () => {
    if (!aiResult || !aiImage || !generateButton) {
      return;
    }

    aiImage.src = aiImages[aiImageIndex % aiImages.length];
    aiResult.classList.remove("hidden");
    generateButton.classList.add("hidden");
  };

  openButtons.forEach((button) => {
    button.addEventListener("click", () => openModal(button));
  });

  closeButtons.forEach((button) => {
    button.addEventListener("click", closeModal);
  });

  generateButton?.addEventListener("click", showAiResult);
  regenerateButton?.addEventListener("click", () => {
    aiImageIndex += 1;
    showAiResult();
  });

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });
};

const initXmlFieldEditing = () => {
  const modal = document.querySelector("#xml-field-modal");
  const modalTitle = modal?.querySelector("#xml-field-modal-title");
  const modalLabel = modal?.querySelector("[data-xml-field-label]");
  const modalValue = modal?.querySelector("[data-xml-field-value]");
  const modeButtons = modal?.querySelectorAll("[data-xml-field-mode]") || [];
  const modePanels = modal?.querySelectorAll("[data-xml-field-panel]") || [];
  const aiPrompt = modal?.querySelector("[data-xml-field-ai-prompt]");
  const aiGenerate = modal?.querySelector("[data-xml-field-ai-generate]");
  const aiRegenerate = modal?.querySelector("[data-xml-field-ai-regenerate]");
  const aiResult = modal?.querySelector("[data-xml-field-ai-result]");
  const aiValue = modal?.querySelector("[data-xml-field-ai-value]");
  const aiUse = modal?.querySelector("[data-xml-field-ai-use]");
  const closeButtons = modal?.querySelectorAll("[data-xml-field-close]") || [];
  const lockedFields = new Set(["price", "sale_price", "availability", "stock_quantity", "stock_status", "delivery_time"]);
  let activeFieldName = "";
  let activeOriginalValue = "";
  let aiVariant = 0;

  if (!modal) {
    return;
  }

  const getFieldName = (label) => label.querySelector("span")?.textContent.trim() || "";
  const getFieldControl = (label) => label.querySelector("input, textarea");

  const closeModal = () => {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    modal.setAttribute("aria-hidden", "true");
  };

  const setMode = (mode) => {
    modeButtons.forEach((button) => {
      const isActive = button.dataset.xmlFieldMode === mode;
      button.classList.toggle("bg-white", isActive);
      button.classList.toggle("text-indigo-700", isActive);
      button.classList.toggle("shadow-sm", isActive);
      button.classList.toggle("text-slate-500", !isActive);
    });

    modePanels.forEach((panel) => {
      panel.classList.toggle("hidden", panel.dataset.xmlFieldPanel !== mode);
    });
  };

  const openModal = (fieldName, value) => {
    activeFieldName = fieldName;
    activeOriginalValue = value;
    aiVariant = 0;

    if (modalTitle) {
      modalTitle.textContent = `Editovat XML hodnotu - ${fieldName}`;
    }

    if (modalLabel) {
      modalLabel.textContent = fieldName;
    }

    if (modalValue) {
      modalValue.value = value;
    }

    if (aiPrompt) {
      aiPrompt.value = "";
    }

    if (aiResult) {
      aiResult.classList.add("hidden");
    }

    setMode("manual");
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    modal.setAttribute("aria-hidden", "false");
  };

  const generateAiValue = () => {
    if (!aiResult || !aiValue) {
      return;
    }

    const suffixes = ["optimalizovano", "vykonnejsi", "feed_ready"];
    const suffix = suffixes[aiVariant % suffixes.length];

    if (activeFieldName.startsWith("custom_label")) {
      aiValue.value = suffix;
    } else if (activeFieldName === "title") {
      aiValue.value = `${activeOriginalValue} - ${suffix}`;
    } else if (activeFieldName === "description") {
      aiValue.value = `${activeOriginalValue} Honzův ukázkový návrh pro lepší čitelnost ve feedu.`;
    } else {
      aiValue.value = `${activeOriginalValue} ${suffix}`.trim();
    }

    aiResult.classList.remove("hidden");
  };

  document.querySelectorAll("main label").forEach((label) => {
    const fieldName = getFieldName(label);
    const control = getFieldControl(label);

    if (!fieldName || !control || label.dataset.xmlFieldPrepared === "1") {
      return;
    }

    label.dataset.xmlFieldPrepared = "1";

    if (lockedFields.has(fieldName)) {
      control.setAttribute("readonly", "true");
      control.classList.add("cursor-not-allowed", "text-slate-500");
      control.classList.remove("focus:border-indigo-500", "focus:bg-white", "focus:ring-4", "focus:ring-indigo-100");
      label.insertAdjacentHTML(
        "beforeend",
        '<span class="mt-1 inline-flex w-fit rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-500 ring-1 ring-slate-200">Needitovatelne</span>'
      );
      return;
    }

    if (fieldName === "URL obrazku" || fieldName === "Zadani pro AI" || fieldName === "Zadání pro Honzu") {
      return;
    }

    const button = document.createElement("button");
    button.type = "button";
    button.className =
      "mt-2 w-fit rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100";
    button.textContent = "Editovat";
    button.addEventListener("click", () => openModal(fieldName, control.value));
    label.append(button);
  });

  closeButtons.forEach((button) => {
    button.addEventListener("click", closeModal);
  });

  modeButtons.forEach((button) => {
    button.addEventListener("click", () => setMode(button.dataset.xmlFieldMode));
  });

  aiGenerate?.addEventListener("click", generateAiValue);
  aiRegenerate?.addEventListener("click", () => {
    aiVariant += 1;
    generateAiValue();
  });
  aiUse?.addEventListener("click", () => {
    if (modalValue && aiValue) {
      modalValue.value = aiValue.value;
    }
    setMode("manual");
  });

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });
};

const initCustomLabelRulesModal = () => {
  const modal = document.querySelector("#custom-label-rules-modal");
  const openButtons = document.querySelectorAll("[data-custom-label-rules-open]");
  const closeButtons = modal?.querySelectorAll("[data-custom-label-rules-close]") || [];
  const modalTitle = modal?.querySelector("[data-custom-label-modal-title]");
  const modalDescription = modal?.querySelector("[data-custom-label-modal-description]");
  const createFlowSections = modal?.querySelectorAll("[data-custom-label-create-flow]") || [];
  const rulesFlow = modal?.querySelector("[data-custom-label-rules-flow]");
  const stepTabs = modal?.querySelectorAll("[data-custom-label-step-tab]") || [];
  const steps = modal?.querySelectorAll("[data-custom-label-step]") || [];
  const labelOptions = modal?.querySelectorAll("[data-custom-label-option]") || [];
  const valueInput = modal?.querySelector("[data-custom-label-value]");
  const ruleLabelSelect = modal?.querySelector("[data-rule-label-select]");
  const ruleValueSelect = modal?.querySelector("[data-rule-value-select]");
  const existingValuesContainer = modal?.querySelector("[data-custom-label-existing-values]");
  const existingValuesTitle = modal?.querySelector("[data-custom-label-library-title]");
  const previewLabel = modal?.querySelector("[data-custom-label-preview-label]");
  const previewValue = modal?.querySelector("[data-custom-label-preview-value]");
  const backButton = modal?.querySelector("[data-custom-label-rules-back]");
  const nextButton = modal?.querySelector("[data-custom-label-rules-next]");
  const stepOrder = ["label", "value"];
  let activeStep = "label";
  let activeMode = "create";
  let selectedLabel = "custom_label_0";
  const customLabelValues = {
    custom_label_0: ["top_vykon", "sport", "accessories", "bottle", "outdoor"],
    custom_label_1: ["high_roas", "margin_ok", "high_pno"],
    custom_label_2: ["jaro", "evergreen", "summer", "autumn"],
    custom_label_3: ["black", "steel", "men"],
    custom_label_4: ["skladem", "omezit_bid"],
  };

  if (!modal || !openButtons.length) {
    return;
  }

  const renderExistingValues = () => {
    if (existingValuesTitle) {
      existingValuesTitle.textContent = selectedLabel;
    }

    if (!existingValuesContainer) {
      return;
    }

    const values = customLabelValues[selectedLabel] || [];
    existingValuesContainer.innerHTML = "";

    if (!values.length) {
      const empty = document.createElement("p");
      empty.className = "rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-500";
      empty.textContent = "Zatim nejsou vytvorene zadne hodnoty pod timto labelem.";
      existingValuesContainer.append(empty);
      return;
    }

    values.forEach((value) => {
      const row = document.createElement("div");
      row.className = "custom-label-library-row";

      const valueText = document.createElement("span");
      valueText.textContent = value;

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.textContent = "Smazat";
      deleteButton.addEventListener("click", () => {
        const shouldDelete = window.confirm(`Smazat tento label ${selectedLabel}: ${value}?`);

        if (!shouldDelete) {
          return;
        }

        customLabelValues[selectedLabel] = (customLabelValues[selectedLabel] || []).filter((item) => item !== value);
        renderExistingValues();
      });

      row.append(valueText, deleteButton);
      existingValuesContainer.append(row);
    });
  };

  const renderRuleValues = () => {
    if (!ruleValueSelect) {
      return;
    }

    const values = customLabelValues[ruleLabelSelect?.value || selectedLabel] || [];
    ruleValueSelect.innerHTML = "";

    values.forEach((value) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      ruleValueSelect.append(option);
    });

    if (!values.length) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "Zatim bez hodnot";
      ruleValueSelect.append(option);
    }
  };

  const updatePreview = () => {
    const value = valueInput?.value.trim() || "bez_hodnoty";

    if (previewLabel) {
      previewLabel.textContent = selectedLabel;
    }

    if (previewValue) {
      previewValue.textContent = value;
    }

    renderExistingValues();
    renderRuleValues();
  };

  const setStep = (step) => {
    activeStep = step;

    stepTabs.forEach((tab) => {
      const isActive = tab.dataset.customLabelStepTab === step;
      tab.classList.toggle("bg-white", isActive);
      tab.classList.toggle("text-indigo-700", isActive);
      tab.classList.toggle("shadow-sm", isActive);
      tab.classList.toggle("text-slate-500", !isActive);
    });

    steps.forEach((panel) => {
      panel.classList.toggle("hidden", activeMode !== "create" || panel.dataset.customLabelStep !== step);
    });

    if (backButton) {
      backButton.classList.toggle("invisible", activeMode !== "create" || step === "label");
    }

    if (nextButton) {
      nextButton.textContent = activeMode === "rules" ? "Ulozit pravidlo" : step === "value" ? "Vytvorit label" : "Pokracovat";
    }

    updatePreview();
  };

  const setLabel = (label) => {
    selectedLabel = label;

    labelOptions.forEach((button) => {
      const isActive = button.dataset.customLabelOption === label;
      button.classList.toggle("border-indigo-100", isActive);
      button.classList.toggle("bg-indigo-50", isActive);
      button.classList.toggle("text-indigo-700", isActive);
      button.classList.toggle("border-slate-200", !isActive);
      button.classList.toggle("bg-white", !isActive);
      button.classList.toggle("text-slate-700", !isActive);
    });

    renderExistingValues();
    updatePreview();
  };

  const setMode = (mode) => {
    activeMode = mode;

    createFlowSections.forEach((section) => {
      section.classList.toggle("hidden", mode !== "create");
    });

    if (rulesFlow) {
      rulesFlow.classList.toggle("hidden", mode !== "rules");
    }

    if (modalTitle) {
      modalTitle.textContent = mode === "rules" ? "Pravidla labelů" : "Custom labely";
    }

    if (modalDescription) {
      modalDescription.textContent =
        mode === "rules"
          ? "Vyber label, hodnotu a filtry produktů. Zvol, zda se má pravidlo aktualizovat automaticky podle výkonu."
          : "Vytvorte hodnotu pod vybranym custom labelem a spravujte hotove hodnoty.";
    }

    if (mode === "rules") {
      renderRuleValues();
    }
  };

  const openModal = (button) => {
    const mode = button?.dataset.customLabelOpenAction === "rules" ? "rules" : "create";
    setMode(mode);
    setLabel("custom_label_0");
    if (valueInput) {
      valueInput.value = "top_vykon";
    }
    if (ruleLabelSelect) {
      ruleLabelSelect.value = "custom_label_0";
    }
    renderRuleValues();
    setStep("label");
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    modal.setAttribute("aria-hidden", "false");
  };

  const closeModal = () => {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    modal.setAttribute("aria-hidden", "true");
  };

  openButtons.forEach((button) => {
    button.addEventListener("click", () => openModal(button));
  });

  closeButtons.forEach((button) => {
    button.addEventListener("click", closeModal);
  });

  labelOptions.forEach((button) => {
    button.addEventListener("click", () => {
      setLabel(button.dataset.customLabelOption);
    });
  });

  valueInput?.addEventListener("input", updatePreview);
  ruleLabelSelect?.addEventListener("change", renderRuleValues);

  backButton?.addEventListener("click", () => {
    const currentIndex = stepOrder.indexOf(activeStep);
    setStep(stepOrder[Math.max(0, currentIndex - 1)]);
  });

  nextButton?.addEventListener("click", () => {
    if (activeMode === "rules") {
      closeModal();
      return;
    }

    const isFinalStep = activeStep === "value";

    if (isFinalStep) {
      const value = valueInput?.value.trim();
      const values = customLabelValues[selectedLabel] || [];

      if (value && !values.includes(value)) {
        customLabelValues[selectedLabel] = [...values, value];
        renderExistingValues();
      }

      closeModal();
      return;
    }

    const currentIndex = stepOrder.indexOf(activeStep);
    setStep(stepOrder[Math.min(stepOrder.length - 1, currentIndex + 1)]);
  });

  stepTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      setStep(tab.dataset.customLabelStepTab);
    });
  });

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });
};

const initFeedAiAndBulkRules = () => {
  const analysisModal = document.querySelector("#feed-ai-analysis-modal");
  const bulkModal = document.querySelector("#bulk-rules-modal");
  const analysisOpenButtons = document.querySelectorAll("[data-feed-ai-analysis-open]");
  const analysisCloseButtons = document.querySelectorAll("[data-feed-ai-analysis-close]");
  const bulkOpenButtons = document.querySelectorAll("[data-bulk-rules-open]");
  const bulkCloseButtons = document.querySelectorAll("[data-bulk-rules-close]");
  const bulkGenerateButton = bulkModal?.querySelector("[data-bulk-rules-generate]");
  const bulkResults = bulkModal?.querySelector("[data-bulk-rules-results]");
  const approvedCount = bulkModal?.querySelector("[data-bulk-rules-approved-count]");

  const openModal = (modal) => {
    modal?.classList.remove("hidden");
    modal?.classList.add("flex");
    modal?.setAttribute("aria-hidden", "false");
  };

  const closeModal = (modal) => {
    modal?.classList.add("hidden");
    modal?.classList.remove("flex");
    modal?.setAttribute("aria-hidden", "true");
  };

  const updateApprovedCount = () => {
    if (!bulkModal || !approvedCount) {
      return;
    }

    const suggestions = bulkModal.querySelectorAll("[data-bulk-suggestion]");
    const approved = bulkModal.querySelectorAll("[data-bulk-suggestion].is-approved");
    approvedCount.textContent = `${approved.length} / ${suggestions.length} schvaleno`;
  };

  analysisOpenButtons.forEach((button) => {
    button.addEventListener("click", () => openModal(analysisModal));
  });

  analysisCloseButtons.forEach((button) => {
    button.addEventListener("click", () => closeModal(analysisModal));
  });

  bulkOpenButtons.forEach((button) => {
    button.addEventListener("click", () => {
      closeModal(analysisModal);
      openModal(bulkModal);
      updateApprovedCount();
    });
  });

  bulkCloseButtons.forEach((button) => {
    button.addEventListener("click", () => closeModal(bulkModal));
  });

  bulkGenerateButton?.addEventListener("click", () => {
    bulkResults?.classList.add("is-visible");
  });

  bulkModal?.querySelectorAll("[data-bulk-approve]").forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest("[data-bulk-suggestion]");
      card?.classList.toggle("is-approved");
      button.textContent = card?.classList.contains("is-approved") ? "Schvaleno" : "Schvalit";
      updateApprovedCount();
    });
  });

  bulkModal?.querySelectorAll("[data-bulk-edit]").forEach((button) => {
    button.addEventListener("click", () => {
      const textarea = button.closest("[data-bulk-suggestion]")?.querySelector("textarea");
      textarea?.focus();
      textarea?.classList.add("is-editing");
    });
  });

  [analysisModal, bulkModal].forEach((modal) => {
    modal?.addEventListener("click", (event) => {
      if (event.target === modal) {
        closeModal(modal);
      }
    });
  });
};

const initProductChartToggles = () => {
  const toggles = document.querySelectorAll("[data-chart-toggle]");

  if (!toggles.length) {
    return;
  }

  toggles.forEach((toggle) => {
    const updateSeries = () => {
      document.querySelectorAll(`[data-chart-series="${toggle.dataset.chartToggle}"]`).forEach((series) => {
        series.classList.toggle("is-hidden", !toggle.checked);
      });
    };

    updateSeries();
    toggle.addEventListener("change", updateSeries);
  });
};

const initProductChartCursor = () => {
  const chart = document.querySelector("[data-product-chart]");
  const cursor = chart?.querySelector("[data-chart-cursor]");
  const tooltip = chart?.querySelector("[data-chart-tooltip]");
  const tooltipDate = chart?.querySelector("[data-chart-tooltip-date]");
  const tooltipValues = chart?.querySelector("[data-chart-tooltip-values]");

  if (!chart || !cursor || !tooltip || !tooltipDate || !tooltipValues) {
    return;
  }

  const points = [
    {
      percent: 6,
      date: "1. 5.",
      values: ["Google CTR: 3,4 %", "Google CPC: 4,62 Kc", "Meta utrata: 620 Kc", "Celkove nakupy: 9 ks", "Skladové zásoby: 72 ks"],
    },
    {
      percent: 18,
      date: "6. 5.",
      values: ["Google CTR: 3,8 %", "Google CPC: 4,55 Kc", "Meta utrata: 760 Kc", "Celkove nakupy: 12 ks", "Skladové zásoby: 64 ks"],
    },
    {
      percent: 30,
      date: "10. 5.",
      values: ["Google CTR: 3,7 %", "Google CPC: 4,48 Kc", "Meta utrata: 890 Kc", "Celkove nakupy: 15 ks", "Skladové zásoby: 55 ks"],
    },
    {
      percent: 43,
      date: "15. 5.",
      values: ["Google CTR: 4,1 %", "Google CPC: 4,38 Kc", "Meta utrata: 1 050 Kc", "Celkove nakupy: 18 ks", "Skladové zásoby: 43 ks"],
    },
    {
      percent: 55,
      date: "18. 5.",
      values: ["Google CTR: 4,4 %", "Google CPC: 4,20 Kc", "Meta utrata: 1 180 Kc", "Celkove nakupy: 22 ks", "Skladové zásoby: 32 ks"],
    },
    {
      percent: 67,
      date: "22. 5.",
      values: ["Google CTR: 4,9 %", "Google CPC: 4,08 Kc", "Meta utrata: 1 420 Kc", "Celkove nakupy: 26 ks", "Skladové zásoby: 20 ks"],
    },
    {
      percent: 79,
      date: "26. 5.",
      values: ["Google CTR: 4,7 %", "Google CPC: 4,12 Kc", "Meta utrata: 1 560 Kc", "Celkove nakupy: 28 ks", "Skladové zásoby: 60 ks"],
    },
    {
      percent: 94,
      date: "31. 5.",
      values: ["Google CTR: 5,3 %", "Google CPC: 4,02 Kc", "Meta utrata: 1 720 Kc", "Celkove nakupy: 31 ks", "Skladové zásoby: 48 ks"],
    },
  ];

  let selectedPoint = points[3];
  const stockToggle = document.querySelector('[data-chart-toggle="stock"]');

  const renderPoint = (point) => {
    selectedPoint = point;
    cursor.style.left = `${point.percent}%`;
    tooltip.style.left = `${Math.min(point.percent + 2, 82)}%`;
    tooltipDate.textContent = point.date;
    tooltipValues.innerHTML = point.values
      .filter((value) => !value.startsWith("Skladové zásoby:") || stockToggle?.checked)
      .map((value) => {
        const [label, metric] = value.split(": ");
        return `<span>${label} <strong>${metric}</strong></span>`;
      })
      .join("");
  };

  const updateFromClientX = (clientX) => {
    const rect = chart.getBoundingClientRect();
    const percent = Math.min(94, Math.max(6, ((clientX - rect.left) / rect.width) * 100));
    const point = points.reduce((nearest, current) =>
      Math.abs(current.percent - percent) < Math.abs(nearest.percent - percent) ? current : nearest
    );

    renderPoint(point);
  };

  renderPoint(selectedPoint);
  stockToggle?.addEventListener("change", () => renderPoint(selectedPoint));
  chart.addEventListener("mousemove", (event) => updateFromClientX(event.clientX));
  chart.addEventListener("touchmove", (event) => updateFromClientX(event.touches[0].clientX), { passive: true });
};

initLogin();
initSidebar();
initShopSelect();
initOverviewTabs();
initPeriodFilter();
initStatusToggles();
initAdsFilter();
initAdsPeriodFilter();
initProductAdvancedFilters();
initNetworkTabs();
initAssignmentModal();
initXmlFeedProductsLink();
initFeedModal();
initImageEditModal();
initXmlFieldEditing();
initCustomLabelRulesModal();
initFeedAiAndBulkRules();
initProductChartToggles();
initProductChartCursor();
