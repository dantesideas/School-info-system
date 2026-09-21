"use strict";

/* =========================================================
   SCHOOL INFORMATION SYSTEM
   DASHBOARD
   SUPABASE + REALTIME
========================================================= */

const SUPABASE_URL =
    "https://aqrdzpvxfkatqwbfnbor.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_5tdz7OcEe_XXKa-yhSe3zw_v7FDw0ON";

let db = null;
let realtimeChannel = null;
let statisticsTimer = null;


/* =========================================================
   HELPER
========================================================= */

function setText(id, value) {

    const element =
        document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}


/* =========================================================
   DASHBOARD MESSAGE
========================================================= */

function showDashboardError(message) {

    const box =
        document.getElementById("dashboardMessage");

    if (!box) return;

    box.textContent = message;
    box.style.display = "block";
}


function hideDashboardError() {

    const box =
        document.getElementById("dashboardMessage");

    if (!box) return;

    box.textContent = "";
    box.style.display = "none";
}


/* =========================================================
   REALTIME STATUS
========================================================= */

function setRealtimeStatus(online, message) {

    const status =
        document.getElementById("realtimeStatus");

    if (!status) return;

    if (online) {

        status.classList.remove("offline");

        status.textContent =
            "🟢 " +
            (message ||
            "Live database updates enabled");

    } else {

        status.classList.add("offline");

        status.textContent =
            "🟠 " +
            (message ||
            "Live updates unavailable. Refreshing normally.");
    }
}


/* =========================================================
   COUNT DATABASE TABLE
========================================================= */

async function countTable(tableName) {

    if (!db) {
        throw new Error(
            "Database connection is not ready."
        );
    }

    const result =
        await db
        .from(tableName)
        .select("*", {
            count: "exact",
            head: true
        });

    if (result.error) {

        throw new Error(
            tableName +
            ": " +
            result.error.message
        );
    }

    return Number(result.count || 0);
}


/* =========================================================
   CHECK AUTHENTICATION
========================================================= */

async function checkAuthentication() {

    if (!db) {
        return false;
    }

    const result =
        await db.auth.getSession();

    if (result.error) {

        console.error(
            "AUTH ERROR:",
            result.error
        );

        window.location.replace(
            "login.html"
        );

        return false;
    }

    if (
        !result.data ||
        !result.data.session
    ) {

        window.location.replace(
            "login.html"
        );

        return false;
    }

    return true;
}


/* =========================================================
   LOAD DASHBOARD STATISTICS
========================================================= */

async function loadStatistics() {

    const ids = [

        "studentCount",
        "teacherCount",
        "classCount",
        "subjectCount",
        "feeCount",
        "resultCount"

    ];

    ids.forEach(function(id) {

        setText(id, "…");

    });

    try {

        const values =
            await Promise.all([

                countTable("students"),

                countTable("teachers"),

                countTable("classes"),

                countTable("subjects"),

                countTable("fees"),

                countTable("results")

            ]);

        setText(
            "studentCount",
            values[0]
        );

        setText(
            "teacherCount",
            values[1]
        );

        setText(
            "classCount",
            values[2]
        );

        setText(
            "subjectCount",
            values[3]
        );

        setText(
            "feeCount",
            values[4]
        );

        setText(
            "resultCount",
            values[5]
        );

        hideDashboardError();

    } catch (error) {

        console.error(
            "DASHBOARD DATA ERROR:",
            error
        );

        ids.forEach(function(id) {

            setText(id, "—");

        });

        showDashboardError(
            "Unable to load dashboard statistics: " +
            error.message
        );
    }
}


/* =========================================================
   REFRESH STATISTICS
========================================================= */

function scheduleStatisticsRefresh() {

    clearTimeout(statisticsTimer);

    statisticsTimer =
        setTimeout(function() {

            loadStatistics();

        }, 300);
}


/* =========================================================
   REALTIME
========================================================= */

function startRealtime() {

    if (!db) return;

    if (realtimeChannel) {

        try {

            db.removeChannel(
                realtimeChannel
            );

        } catch (error) {

            console.warn(
                "Unable to remove old realtime channel:",
                error
            );
        }
    }

    realtimeChannel =
        db
        .channel(
            "school-dashboard-realtime"
        )

        .on(
            "postgres_changes",
            {
                event: "*",
                schema: "public",
                table: "students"
            },
            function(payload) {

                console.log(
                    "Students changed:",
                    payload
                );

                scheduleStatisticsRefresh();
            }
        )

        .on(
            "postgres_changes",
            {
                event: "*",
                schema: "public",
                table: "teachers"
            },
            function(payload) {

                console.log(
                    "Teachers changed:",
                    payload
                );

                scheduleStatisticsRefresh();
            }
        )

        .on(
            "postgres_changes",
            {
                event: "*",
                schema: "public",
                table: "classes"
            },
            function(payload) {

                console.log(
                    "Classes changed:",
                    payload
                );

                scheduleStatisticsRefresh();
            }
        )

        .on(
            "postgres_changes",
            {
                event: "*",
                schema: "public",
                table: "subjects"
            },
            function(payload) {

                console.log(
                    "Subjects changed:",
                    payload
                );

                scheduleStatisticsRefresh();
            }
        )

        .on(
            "postgres_changes",
            {
                event: "*",
                schema: "public",
                table: "fees"
            },
            function(payload) {

                console.log(
                    "Fees changed:",
                    payload
                );

                scheduleStatisticsRefresh();
            }
        )

        .on(
            "postgres_changes",
            {
                event: "*",
                schema: "public",
                table: "results"
            },
            function(payload) {

                console.log(
                    "Results changed:",
                    payload
                );

                scheduleStatisticsRefresh();
            }
        )

        .on(
            "postgres_changes",
            {
                event: "*",
                schema: "public",
                table: "exams"
            },
            function(payload) {

                console.log(
                    "Exams changed:",
                    payload
                );

                scheduleStatisticsRefresh();
            }
        )

        .on(
            "postgres_changes",
            {
                event: "*",
                schema: "public",
                table: "marks"
            },
            function(payload) {

                console.log(
                    "Marks changed:",
                    payload
                );

                scheduleStatisticsRefresh();
            }
        )

        .subscribe(function(status) {

            console.log(
                "Realtime status:",
                status
            );

            if (
                status ===
                "SUBSCRIBED"
            ) {

                setRealtimeStatus(
                    true,
                    "Live database updates enabled"
                );

            } else if (
                status ===
                "CHANNEL_ERROR"
            ) {

                setRealtimeStatus(
                    false,
                    "Realtime connection error"
                );

            } else if (
                status ===
                "TIMED_OUT"
            ) {

                setRealtimeStatus(
                    false,
                    "Realtime connection timed out"
                );

            } else if (
                status ===
                "CLOSED"
            ) {

                setRealtimeStatus(
                    false,
                    "Realtime connection closed"
                );
            }
        });
}


/* =========================================================
   LOGOUT
========================================================= */

async function logoutUser() {

    const button =
        document.getElementById(
            "logoutButton"
        );

    /*
       Prevent multiple clicks
    */

    if (button) {

        button.disabled = true;

        button.textContent =
            "Logging out...";
    }

    try {

        if (!db) {

            window.location.replace(
                "login.html"
            );

            return;
        }

        const result =
            await db.auth.signOut();

        if (result.error) {

            throw result.error;
        }

        /*
           Supabase has successfully
           signed the user out.
        */

        window.location.replace(
            "login.html"
        );

    } catch (error) {

        console.error(
            "LOGOUT ERROR:",
            error
        );

        if (button) {

            button.disabled = false;

            button.textContent =
                "Logout";
        }

        showDashboardError(
            "Unable to logout: " +
            error.message
        );
    }
}


/* =========================================================
   AUTH STATE LISTENER
========================================================= */

function startAuthListener() {

    if (!db) return;

    db.auth.onAuthStateChange(
        function(event) {

            console.log(
                "AUTH EVENT:",
                event
            );

            if (
                event ===
                "SIGNED_OUT"
            ) {

                window.location.replace(
                    "login.html"
                );
            }
        }
    );
}


/* =========================================================
   START DASHBOARD
========================================================= */

async function startDashboard() {

    try {

        if (
            !window.supabase ||
            typeof window.supabase.createClient !==
            "function"
        ) {

            throw new Error(
                "Supabase library failed to load."
            );
        }

        db =
            window.supabase.createClient(
                SUPABASE_URL,
                SUPABASE_PUBLISHABLE_KEY
            );

        const authenticated =
            await checkAuthentication();

        if (!authenticated) {
            return;
        }

        await loadStatistics();

        startAuthListener();

        startRealtime();

    } catch (error) {

        console.error(
            "DASHBOARD START ERROR:",
            error
        );

        showDashboardError(
            error.message ||
            "Unable to start dashboard."
        );
    }
}


/* =========================================================
   PAGE START
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        const logoutButton =
            document.getElementById(
                "logoutButton"
            );

        if (logoutButton) {

            logoutButton.addEventListener(
                "click",
                logoutUser
            );
        }

        startDashboard();
    }
);
