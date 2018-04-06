# boxed-immutable

```javascript 
const _$ = require('boxed-immutable').box;

let state = {
    isLoaded: false,
    isLoading: false,
    appSettings: {
        title: "The Title",
    }
};

let state_$ = _$(state);
let dashboardName = "overview";
let showDashboard;
let title;

showDashboard = state_$.appSettings.dashboards[dashboardName].showDashboard.$_; // result is undefined
title = state_$.appSettings.title.$_; // result is "The Title"
```
