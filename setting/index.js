const SAVED_CITIES_KEY = "savedCities";
const EDIT_MODE_KEY = "locationsEditMode";
const SEARCH_QUERY_KEY = "citySearchQuery";
const SEARCH_REQUEST_KEY = "citySearchRequest";
const SEARCH_RESULTS_KEY = "citySearchResults";
const SEARCH_STATUS_KEY = "citySearchStatus";
const MAX_CITIES = 5;

const COLORS = {
    background: "#111111",
    navigation: "#1c1c1e",
    card: "#1c1c1e",
    divider: "#303033",
    text: "#f5f5f7",
    secondaryText: "#9a9a9f",
    accent: "#3b82f6",
    destructive: "#ff453a",
    search: "#343438",
};

function parseArray(value) {
    if (!value) return [];

    try {
        const parsed = typeof value === "string" ? JSON.parse(value) : value;
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        return [];
    }
}

function cityKey(city) {
    if (city && city.id !== undefined && city.id !== null) return String(city.id);
    return [city.name, city.admin1, city.country].join("|").toLowerCase();
}

function citySubtitle(city) {
    const parts = [];
    if (city.admin1 && city.admin1 !== city.name) parts.push(city.admin1);
    if (city.country) parts.push(city.country);
    return parts.join(", ");
}

function saveCities(storage, cities) {
    storage.setItem(SAVED_CITIES_KEY, JSON.stringify(cities));
}

function text(content, style, extraProps) {
    return Text(
        Object.assign(
            {
                style: style || {},
            },
            extraProps || {}
        ),
        [content]
    );
}

function renderLocationRow(city, index, count, editMode, onDelete) {
    const titleChildren = [
        text(city.name, {
            color: COLORS.text,
            fontSize: "18px",
            lineHeight: "23px",
        }),
    ];

    const rowChildren = [];
    if (editMode) {
        rowChildren.push(
            View(
                {
                    onClick: onDelete,
                    style: {
                        width: "28px",
                        height: "28px",
                        border: "2px solid " + COLORS.destructive,
                        borderRadius: "14px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: "14px",
                    },
                },
                [
                    View(
                        {
                            style: {
                                width: "14px",
                                height: "2px",
                                background: COLORS.destructive,
                                borderRadius: "1px",
                            },
                        },
                        []
                    ),
                ]
            )
        );
    }

    rowChildren.push(
        View(
            {
                style: {
                    flex: "1",
                    padding: "17px 0",
                },
            },
            titleChildren
        )
    );

    if (!editMode) {
        rowChildren.push(
            View(
                {
                    style: {
                        width: "24px",
                        height: "24px",
                        border: "2px solid " + COLORS.secondaryText,
                        borderRadius: "12px",
                        marginLeft: "14px",
                    },
                },
                []
            )
        );
    }

    return View(
        {
            style: {
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                minHeight: "64px",
                borderBottom:
                    index < count - 1 ? "1px solid " + COLORS.divider : "none",
            },
        },
        rowChildren
    );
}

function renderListPage(props, cities, editMode, showSearchPage) {
    const storage = props.settingsStorage;
    const hasCities = cities.length > 0;

    const rows = cities.map((city, index) =>
        renderLocationRow(city, index, cities.length, editMode, () => {
            const key = cityKey(city);
            const nextCities = cities.filter((item) => cityKey(item) !== key);
            saveCities(storage, nextCities);
            if (nextCities.length === 0) storage.setItem(EDIT_MODE_KEY, "false");
        })
    );

    const content = [
        View(
            {
                style: {
                    flex: "1",
                    padding: "30px 24px 120px",
                },
            },
            [
                View(
                    {
                        style: {
                            paddingBottom: "12px",
                        },
                    },
                    [
                        text("Added Locations  (Up to 5 locations can be added)", {
                            color: COLORS.secondaryText,
                            fontSize: "16px",
                            lineHeight: "22px",
                        }),
                    ]
                ),
                hasCities
                    ? View(
                        {
                            style: {
                                background: COLORS.card,
                                borderRadius: "12px",
                                padding: "0 16px",
                            },
                        },
                        rows
                    )
                    : View(
                        {
                            style: {
                                background: COLORS.card,
                                borderRadius: "12px",
                                padding: "22px 16px",
                            },
                        },
                        [
                            text("Tap Add button to search for a city", {
                                color: COLORS.secondaryText,
                                fontSize: "15px",
                                textAlign: "center",
                            }, { align: "center" }),
                        ]
                    ),
                cities.length >= MAX_CITIES
                    ? text("Maximum of 5 locations reached", {
                        color: COLORS.secondaryText,
                        fontSize: "13px",
                        textAlign: "center",
                        marginTop: "12px",
                    }, { align: "center" })
                    : View({}, []),
            ]
        ),
        View(
            {
                style: {
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "center",
                    gap:
                        cities.length < MAX_CITIES && !editMode && hasCities
                            ? "44px"
                            : "0",
                    background: COLORS.navigation,
                    borderTop: "1px solid " + COLORS.divider,
                    padding: "12px 18px 22px",
                    position: "fixed",
                    left: "0",
                    right: "0",
                    bottom: "0",
                },
            },
            [
                cities.length < MAX_CITIES && !editMode
                    ? View(
                        {
                            onClick: () => {
                                showSearchPage();
                                storage.setItem(SEARCH_QUERY_KEY, "");
                                storage.setItem(SEARCH_RESULTS_KEY, "[]");
                                storage.setItem(SEARCH_STATUS_KEY, "idle");
                            },
                            style: {
                                minWidth: "72px",
                                padding: "2px 10px",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                            },
                        },
                        [
                            text("＋", {
                                color: COLORS.accent,
                                fontSize: "30px",
                                textAlign: "center",
                                lineHeight: "30px",
                            }, { align: "center" }),
                            text("Add", {
                                color: COLORS.accent,
                                fontSize: "14px",
                                textAlign: "center",
                                marginTop: "2px",
                            }, { align: "center" }),
                        ]
                    )
                    : View({}, []),
                hasCities
                    ? View(
                        {
                            onClick: () =>
                                storage.setItem(EDIT_MODE_KEY, editMode ? "false" : "true"),
                            style: {
                                minWidth: "72px",
                                padding: "2px 10px",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                            },
                        },
                        [
                            text(editMode ? "✓" : "✎", {
                                color: COLORS.accent,
                                fontSize: editMode ? "27px" : "28px",
                                textAlign: "center",
                                lineHeight: "30px",
                            }, { align: "center" }),
                            text(editMode ? "Done" : "Edit", {
                                color: COLORS.accent,
                                fontSize: "14px",
                                textAlign: "center",
                                marginTop: "2px",
                            }, { align: "center" }),
                        ]
                    )
                    : View({}, []),
            ]
        ),
    ];

    return View(
        {
            style: {
                minHeight: "100vh",
                background: COLORS.background,
                display: "flex",
                flexDirection: "column",
            },
        },
        content
    );
}

function renderSearchResult(props, city, savedCities, isLast, showListPage) {
    const storage = props.settingsStorage;
    const alreadyAdded = savedCities.some((item) => cityKey(item) === cityKey(city));
    const disabled = alreadyAdded || savedCities.length >= MAX_CITIES;
    const subtitle = citySubtitle(city);

    return View(
        {
            onClick: disabled
                ? undefined
                : () => {
                    showListPage();
                    saveCities(storage, savedCities.concat([city]).slice(0, MAX_CITIES));
                    storage.setItem(EDIT_MODE_KEY, "false");
                },
            style: {
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                padding: "17px 16px",
                background: COLORS.card,
                borderBottom: isLast ? "none" : "1px solid " + COLORS.divider,
                opacity: disabled ? "0.45" : "1",
            },
        },
        [
            View(
                { style: { flex: "1" } },
                [
                    text(city.name, { color: COLORS.text, fontSize: "17px" }),
                    subtitle
                        ? text("\u00a0" + subtitle, {
                            color: COLORS.secondaryText,
                            fontSize: "13px",
                            marginTop: "3px",
                        })
                        : View({}, []),
                ]
            ),
            text(alreadyAdded ? "Added" : "+", {
                color: alreadyAdded ? COLORS.secondaryText : COLORS.accent,
                fontSize: alreadyAdded ? "13px" : "26px",
                marginLeft: "12px",
            }),
        ]
    );
}

function renderSearchPage(props, savedCities, showListPage) {
    const storage = props.settingsStorage;
    const query = storage.getItem(SEARCH_QUERY_KEY) || "";
    const status = storage.getItem(SEARCH_STATUS_KEY) || "idle";
    const results = parseArray(storage.getItem(SEARCH_RESULTS_KEY));
    const trimmedQuery = query.trim();

    const goBack = () => {
        showListPage();
        storage.setItem(SEARCH_STATUS_KEY, "idle");
    };

    const search = () => {
        if (trimmedQuery.length < 2) {
            storage.setItem(SEARCH_STATUS_KEY, "short-query");
            return;
        }

        storage.setItem(SEARCH_STATUS_KEY, "loading");
        storage.setItem(SEARCH_RESULTS_KEY, "[]");
        storage.setItem(
            SEARCH_REQUEST_KEY,
            JSON.stringify({ query: trimmedQuery, requestedAt: Date.now() })
        );
    };

    const resultChildren = results.map((city, index) =>
        renderSearchResult(
            props,
            city,
            savedCities,
            index === results.length - 1,
            showListPage
        )
    );

    const inputProps = {
        // Zepp's mobile renderer may not display an empty TextInput when only
        // `placeholder` is supplied, so use the label as a visible fallback.
        // It is removed as soon as the user enters a value.
        label: query ? "" : "Enter city",
        placeholder: "Enter city",
        value: query,
        bold: false,
        style: {
            width: "100%",
            height: "44px",
            lineHeight: "44px",
            background: COLORS.search,
            borderRadius: "18px",
            padding: "0 16px",
            display: "block",
            boxSizing: "border-box",
        },
        labelStyle: query
            ? { display: "none" }
            : {
                color: "#747478",
                fontSize: "17px",
                width: "100%",
                height: "44px",
                lineHeight: "44px",
                paddingLeft: "16px",
                boxSizing: "border-box",
                display: "block",
            },
        subStyle: query
            ? {
                color: COLORS.text,
                fontSize: "17px",
                width: "100%",
                height: "44px",
                lineHeight: "44px",
                paddingLeft: "16px",
                boxSizing: "border-box",
                display: "block",
            }
            : { display: "none" },
        onChange: (value) => {
            storage.setItem(SEARCH_QUERY_KEY, value || "");
            if (status !== "idle") storage.setItem(SEARCH_STATUS_KEY, "idle");
        },
    };
    if (status === "loading") {
        resultChildren.push(
            text("Searching…", {
                color: COLORS.secondaryText,
                fontSize: "15px",
                textAlign: "center",
                padding: "28px 0",
            }, { align: "center" })
        );
    } else if (status === "error") {
        resultChildren.push(
            text("Couldn’t search right now. Check your connection and try again.", {
                color: COLORS.secondaryText,
                fontSize: "14px",
                textAlign: "center",
                padding: "28px 16px",
            }, { align: "center" })
        );
    } else if (status === "empty") {
        resultChildren.push(
            text("No matching locations found.", {
                color: COLORS.secondaryText,
                fontSize: "15px",
                textAlign: "center",
                padding: "28px 0",
            }, { align: "center" })
        );
    } else if (status === "short-query") {
        resultChildren.push(
            text("Enter at least 2 characters.", {
                color: COLORS.secondaryText,
                fontSize: "14px",
                textAlign: "center",
                padding: "18px 0",
            }, { align: "center" })
        );
    }

    return View(
        {
            style: {
                minHeight: "100vh",
                background: COLORS.background,
            },
        },
        [
            View(
                {
                    style: {
                        padding: "22px 20px 28px",
                    },
                },
                [
                    View(
                        {
                            style: {
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                marginBottom: "18px",
                            },
                        },
                        [
                            View(
                                {
                                    style: {
                                        flex: "1",
                                        background: COLORS.search,
                                        borderRadius: "18px",
                                        height: "44px",
                                        marginRight: "10px",
                                        display: "block",
                                    },
                                },
                                [
                                    TextInput(inputProps),
                                ]
                            ),
                            trimmedQuery.length > 0
                                ? Button({
                                    label: "Search",
                                    color: "primary",
                                    onClick: search,
                                })
                                : View({}, []),
                            View(
                                {
                                    onClick: goBack,
                                    style: { padding: "10px 0 10px 12px" },
                                },
                                [text("Cancel", { color: COLORS.accent, fontSize: "15px" })]
                            ),
                        ]
                    ),
                    View(
                        {
                            style: {
                                borderRadius: "10px",
                                overflow: "hidden",
                            },
                        },
                        resultChildren
                    ),
                ]
            ),
        ]
    );
}

AppSettingsPage({
    state: {
        page: "list",
    },

    build(props) {
        const cities = parseArray(props.settingsStorage.getItem(SAVED_CITIES_KEY)).slice(
            0,
            MAX_CITIES
        );
        const editMode =
            cities.length > 0 && props.settingsStorage.getItem(EDIT_MODE_KEY) === "true";
        const showListPage = () => {
            this.state.page = "list";
        };
        const showSearchPage = () => {
            this.state.page = "search";
        };

        return this.state.page === "search"
            ? renderSearchPage(props, cities, showListPage)
            : renderListPage(props, cities, editMode, showSearchPage);
    },
});
