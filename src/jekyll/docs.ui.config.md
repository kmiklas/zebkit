---
layout: page
parent: docs
---

## UI component self configuration 

Zebkit UI components apply default properties values during its instantiation. The default properties values are read from static context of appropriate UI component class or from a parent class (if it has been configured). For instance, to change color of all subsequent "zebkit.ui.Label" component instances set appropriate property on label component class level:

```js
// specify default label color value in label class static context  
zebkit.ui.Label.color = "orange";
...
// all label instances will have color set to "orange"
var lab1 = new zebkit.ui.Label("Label");
var lab2 = new zebkit.ui.Label("Label");
...
```

By default properties values defined on parent class level are not applied to an instance of a class that inherits the parent class. To change the behavior do the following:

```js 
// zebkit.ui.TextField class inherits zebkit.ui.Label
// class. To take in account label default properties 
// let's set "inheritProperties" to true 
zebkit.ui.TextField.inheritProperties = true;
...
// specify default label color value in label class static context 
zebkit.ui.Label.color = "orange";
...
// text field component instances will have color set to "orange"
var tf1 = new zebkit.ui.TextField("Text field 1");
var tf2 = new zebkit.ui.TextField("Text field 2");
```

## Configuration resources 

By default UI configuration JSON files are stored on the same level with zebkit JS file in "rs" folder. The structure is shown below:

```sh
[rs]                      # root resource folder
 +-- [light]              # light theme resources folder
 |     +--  ui.json       # zebkit.ui package configuration  
 |     +--  ui.web.json   # zebkit.ui.web package configuration
 |     +--  ui.tree.json  # zebkit.ui.tree package configuration
 |     +--  ui.grid.json  # zebkit.ui.grid package configuration
 +-- [dark]               # dark theme resources folder
 |     +--  ui.json
 |     +--  ui.web.json
 |     +--  ui.tree.json
 |     +--  ui.grid.json
 |
 +-- ui.common.json
```


Loading JSON configurations setup static fields for appropriate class that later will be used as default properties values for the class instances. Configuration occurs on the package level. In other words zebkit keeps JSON configuration per package (if necessary). It is possible to load a custom configuration manually with "configWith([path])" method. For instance, imagine we have JSON below to customize text field component properties:       

```js
{
    ...
    "TextField" : {
        "border"    :{"@zebkit.draw.Border":["red", 2]},
        "color"     :"white",
        "background":{"@zebkit.draw.Gradient":["red","orange"]}
    }
}
```

Then we can configure "zebkit.ui" package with the JSON as follow:

```js
zebkit.ui.configWith("/tf.json");
```

Pay attention how zebkit looks for required JSON:
   - Passed path starts from "/" or is an URL (e.g. "http://text.com/tf.json") then the path is considered as absolute path and is used as is to read the required resource
   - Passed path 

## Theme configuration

By default zebkit expects theme resources are located in "rs" folder at the the same level where zebkit JS code is stored. To switch UI theme set theme name (has to match a sub-folder hosted in "rs" folder):

```js
// say to use light theme
 // name of theme folder
```

In a case if zebkit theme is placed in another place specify base directory where the theme resources are stored: 

```js
// define path to custom theme    
zebkit.ui.config("basedir","http://test.com./myfolder/mytheme");
```

If you has number of themes you can use place holder to simplify switching between these themes:
```js
// define path to light theme    
zebkit.ui.config("basedir","http://test.com./myfolder/%{theme}");
...
// specify theme to be used
zebkit.ui.config("theme", "mytheme1");
```

**Note:** Note that configuration variables (theme, base directory, etc) have to be adjusted outside "require" or "package" zebkit  sections. In general it should look as follow:
```js
<script>
    // adjust theme variable
    zebkit.ui.config("theme","light");

    zebkit.require("ui", function(ui) {
        // develop UI 
        ...
    }); 
</script>
```

## Zson as form descriptive language 

JSON format is handy and clear way to declare various configurations, transfer data between clients and servers, etc. Zebkit extends JSON format interpretation with number of powerful features what allows developers to use it for UI form definition. 

To load the JSON UI definition the following code can be used:

```js
zebkit.require("ui", function(ui) {
    new ui.zCanvas(400, 300).root.load("simple.json");
});
```

For example, let's load the following Zson:

```json
{
    "layout": { "@zebkit.layout.StackLayout" : []},
    "kids"  : [{
        "@zebkit.ui.Panel": [],
        "layout" : { "@zebkit.layout.BorderLayout" :4 },
        "padding": 4,
        "border" : "plain",
        "kids"   : {
            "top": {
                "@zebkit.ui.BoldLabel": "Simple application",
                "padding"             : 4
            },
            "center": { "@zebkit.ui.TextArea": "" },
            "bottom": {
                "@zebkit.ui.Button": "Clear",
                "canHaveFocus"     : false
            }
       }
    }],
    "#actions" : [{
        "source"  : "//zebkit.ui.Button",
        "target"  : {
            "path"   : "//zebkit.ui.TextArea",
            "update" : { "value": "" }
        }
    }]
}
```

The result of the loading is shown below:

{% include zsample.html canvas_id='zsonForm1' title='JSON UI' description=description %}                    

<script type="text/javascript">
    zebkit.require("ui", function(ui) {
       var r = new ui.zCanvas("zsonForm1", 400, 300).root;
       r.load("public/simple.json").catch();
    });
</script>

There is "#actions" section in the JSON shown above. The section allows developers to declare simple event handling. In this particular case the section says to clear text area component text by button click. Full supported features of the section are shown below:

<table class="info">
<tr><th>
JSON element    
</th><th>
Description
</th></tr>

<tr><td>
"#actions.source"    
</td><td>
Path to identify a source component that fires an event(s)
</td></tr>

<tr><td>
"#actions.event"    
</td><td>
Optional an event name that has to be handled from the source
</td></tr>

<tr><td>
"#actions.targets" or
<br/>
"#actions.target"    
</td><td>
List of targets ("#actions.targets") components or single target ("#actions.target") component to be updated by the source event(s)
</td></tr>

<tr><td>
"#actions.target.path" 
</td><td>
Path to detect a target component
</td></tr>

<tr><td>
"#actions.target.update" 
</td><td>
Properties set the target has to be updated
</td></tr>

<tr><td>
"#actions.target.do" 
</td><td>
Set of actions over the target component  
</td></tr>

</table>

## Composing Zson

Zson can be composed from multiple JSONs. Zson guarantees everything is loaded in a order it is mentioned in Zson, so you can safely add references to variables located in external JSONs if the reference appears later.

To combine multiple JSONs:

```js
{
    "%{../external1.json}": '',
    "%{../external2.json}": ''
    "key" : {
        ...
    }
}
```

Or you can fulfill a value with the given JSON as follow:

```js
{
    "key" : "%{../external.json}"
}
```

For example let use slightly modified JSON from previous UI example to populate the same UI four times:

```js
{
    "@zebkit.ui.Panel": [],
    "layout": { "@zebkit.layout.StackLayout" : []},
    "kids"  : [{
        "@zebkit.ui.Panel":[],
        "layout" : { "@zebkit.layout.BorderLayout" :4 },
        "padding": 4,
        "border" : "plain",
        "kids"   : {
            "top": {
                "@zebkit.ui.BoldLabel": "Simple application",
                "padding"             : 4
            },
            "center": { "@zebkit.ui.TextArea": "" },
            "bottom": {
                "@zebkit.ui.Button": "Clear",
                "canHaveFocus"     : false
            }
       }
    }],
    "#actions" : [{
        "source"  : "//zebkit.ui.Button",
        "target"  : {
            "path"   : "//zebkit.ui.TextArea",
            "update" : { "value": "" }
        }
    }]
}
```

The JSON to load external JSON four times shown below:  

```js
{
    "layout" : { "@zebkit.layout.GridLayout": [2, 2, true, true] },
    "kids"   : [
        "%{./simple.json}",
        "%{./simple.json}",
        "%{./simple.json}",
        "%{./simple.json}"
    ]
}
```


The result is the application below:

{% include zsample.html canvas_id='zsonForm2' title='Combining JSONs' description=description %}                    

<script type="text/javascript">
    zebkit.require("ui", function(ui) {
       var r = new ui.zCanvas("zsonForm2", 500, 500).root;
       r.load("public/simple2.json").catch();
    });
</script>
