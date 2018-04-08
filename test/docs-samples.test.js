const boxedImmutable = require('boxed-immutable');

describe(`Wiki Transforms`, () => {
    test(`showDashboard true or false`, () => {
        // Now setting dashboard properties with transforms will always result in the values being true or false
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
                '': dashBoardTransforms, // this will match any property key, ie. all dashboards
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
        const state_$ = boxedImmutable.boxState(() => {
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

