describe(`README`, () => {
    test(`readme useage`, () => {
        const boxState = require('boxed-state');

        // your function for returning the current immutable state object
        function getSimpleState() {
        }

        let state_$;

        // your current function for setting a new state
        function saveState(newState) {
            // 1. update state
            // 2. regardless of how this function is called, cancel
            //    the cached boxed state, then next access will be forced to
            //    get a fresh state
            state_$.cancel();
        }

        // wrap in proxy so boxed state can be provided automatically
        // use in new getState to get boxed state using default createBox options
        state_$ = boxState(() => {
            return getSimpleState();
        }, (modified, boxed) => {
            // call the save state function to apply changes in full
            saveState(modified);

            // or if your saveState can handle delta
            //saveState(boxed.$_delta$);
            // or anything else without having to change the users of your state API
        });

        // use new function to provide access to now boxed immutable state
        function getState() {
            return state_$;
        }

        function handleEvent() {
            // somewhere in the code.
            let state_$ = getState();

            // can use state as before or as boxed state, except now there is no need to get a new state
            // every time. The same state will reflect latest changes. Make a copy if you need immutable state

            // NOTE: properties returned by state_$ are mutable, make a copy of state_$.$_value
            // or use the old getSimpleState() function if you need an immutable copy between state change

            // make changes to state_$ properties

            // saving is handled by the provider instead of having the caller know how to update state
            state_$.save(); // save changes
            // state_$.cancel(); // or to discard changes
            // next access to any property of the boxed state will get a fresh copy of the state
        }
    });
});

describe(`Wiki Transforms`, () => {
    test(`showDashboard true or false`, () => {
        const boxedImmutable = require('boxed-immutable');
        const boxState = require('boxed-state');

        let dashBoardState = {
            showDashboard: false,
            collapsed: false,
            dashboardTitle: "",
        };

        function toBoolean(value) {
            return !!value;
        }

        const dashBoardTransforms = {
            showDashboard: toBoolean,
            collapsed: toBoolean,
        };

        let stateShape = {
            dashboards: {
                overview: {},
                mismatches: {},
                translation: {},
            },
        };

        const stateTransforms = {
            dashboards: {
                '_$': dashBoardTransforms, // this will match any property key, ie. all dashboards
            },
        };

        const transformingBox = boxedImmutable.createBox({ setTransforms: stateTransforms });

        // create boxed state using this box
        let state = {
            // dashboards: {
            //     overview: {},
            //     mismatches: {},
            //     translation: {},
            // },
        };

        // our current immutable state
        const state_$ = boxState(() => {
            return state;
        }, (modified, boxed) => {
            state_$.cancel();
            state = modified;
        }, transformingBox);

        state_$.dashboards.overview.showDashboard = undefined;
        let showDashboard = state_$.dashboards.overview.showDashboard();
        expect(showDashboard).toBe(false);
    });
});

