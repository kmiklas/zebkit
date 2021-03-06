---
layout: page
parent: docs
title: Start with zebkit 
---

In general zebkit is a JavaScript framework that is supposed to be used for UI development. In the same time the framework provides a lot of artifacts and concepts that are abstracted from UI stuff and can be used independently:   

   * __Easy OOP__. This this the basement for everything in zebkit: packaging, various components buildings, resource management.    
   * __Zson__. JSON as JavaScript objects descriptive language with extended  possibility of inclusions, object instantiations and so on.
   * __Data model__. Number of classes and interfaces to represent difefrent data models like list, tree, matrix and so on
   * etc  

## Choose zebkit version

All zebkit artifacts are published on web site. They are applicable either for remote usage or can be downloaded and hosted in a local environment. The artifacts are hosted on web site as follow:

```sh
http://www.zebkit.org/ver        # root zebkit versions URL
   |
   +-- latest/                   # latest hot updated stable version
   |     +-- zebkit[.min].js     # zebkit JS code
   |     +-- rs/                 # resources: JSON, images, etc
   |     +-- zebkit.runtime.zip  # packages runtime for local use
   |     .         
   .
   +-- 2017.05/                  # released at May of 2017 version
   |     +-- zebkit[.min].js     # zebkit JS code  
   |     +-- rs/                 # resources: JSON, images, etc
   |     +-- zebkit.runtime.zip  # packages runtime for local use
   .     .
   .
   +-- sandbox/                  # playground version 
```


__What the latest zebkit version is__

The **latest** (<a href="http://www.zebkit.org/ver/latest">http://www.zebkit.org/ver/latest</a>) is the version that is considered as the most stable and bug free snapshot of github version. For developers using the latest means:
   * They stick to the most actual and quite stable version with the hottest fixes and the most recent new features.
   * They should never care about bloody version name or code to address the version they need. They always get the latest one. 
   * They are in a risk with the latest version updates. That means a recent update of the latest version can add a bug or (in rare cases) even backward compatible issues. 

__What released zebkit versions are__

There is also zebkit release versions are identified with year and month. The versions are updated only in a case of critical bugs that have not been fixed in subsequent versions. The appropriate artifacts are available by the following pattern: <a href="#">http://zebkit.org/ver/year.month/* </a>

For instance released at May of 2017 version can be fetched with the following URL: <a href="http://zebkit.org/ver/2017.05/zebkit.js">http://zebkit.org/ver/2017.05/zebkit.js
</a>


## Add zebkit to a project

Zebkit can be included into your project (page) one of the following manner:
   
   * Include the version of zebkit hosted on zebkit web site. The latest stable version is available by fixed URL (or add any other desired version): <a href="#">http://zebkit.org/ver/latest/zebkit.[min.]js</a> 
   
   * Download required runtime package and unzip it in context of your WEB server. Again the latest zebkit version can be found by the following URL: <a href="http://zebkit.org/ver/latest/zebkit.runtime.zip">http://zebkit.org/ver/latest/zebkit.runtime.zip</a>

   * Checkout version from github and read the instruction how it can be used: <a href="https://github.com/barmalei/zebkit">https://github.com/barmalei/zebkit</a>

Add meta (optionally, for mobile devices only) and script to an HTML page as follow:

```html
<!DOCTYPE html>
<html>
<head>
<!-- The following meta is required for mobile devices -->
<meta name="viewport" 
content="user-scalable=no,width=device-width,initial-scale=1,maximum-scale=1">
<meta name="msapplication-tap-highlight" content="no">

<!-- Add zebkit JavaScript library  -->
<script type="text/javascript"
        src="http://zebkit.org/ver/latest/zebkit.min.js">
</script>
</head>

<body>
...
</body>
</html>
```


## Develop with zebkit package(s)

Zebkit stuff is organized as hierarchy of packages. Package is key zebkit structure that unites number of classes, methods, variables and interfaces that are designed for some functional purposes. 

When zebkit is included into an HTML page you will get global "zebkit" variable. This is the root package you have to start from: 

```js
// request "zebkit.ui", "zebkit.layout" and "zebkit.ui.grid" package  
zebkit.require("ui", "layout", "ui.grid", function(ui, layout, grid) {
    var button = new ui.Button("My Button");
    ...
});
```

Above zebkit "require" call does the following:

   * Requests three packages: "zebkit.ui", "zebkit.layout", "zebkit.ui.grid"
   * Call callback method that guarantees that all the tree packages are ready to be used: the HTML page is completely loaded and requested packages are completely configured.  

Inside the require callback method you should start developing a zebkit application.

When you develop your own zebkit code it should be reasonable to stick to zebkit package concept. That means re-usable components, classes and other things should placed in a package or packages. Creation of a zebkit package is simple:  

```js
// create new package 
zebkit.package("mypackage", function(pkg, Class) {
    // define package class 
    pkg.MyClass = Class([
        function() {  // constructor
            ...
        },

        function method() {
            ...
        }
    ]);
    ...
});
```

Then you can use the created package as follow:

```js
// create new package 
zebkit.require("mypackage", function(mypkg) {
    // instantiate class declared in your package 
    var myClassInstance = new mypkg.MyClass();
    ...
});
```


## Package configuration 

Package can be configured with a JSON. 

   -  

## Standard zebkit packages

Standard packages that are supplied with zebkit (embedded with "zebkit.js") are listed in the table below:

<table class="info">
<tr><th>Package name</th><th>Description</th></tr>

<tr>
<td>zebkit</td>
<td>
The root zebkit package that provides core easy OOP classes and interfaces.  
</td>
</tr>

<tr>
<td>zebkit.util</td>
<td>
The package provides number of utility classes and methods.
</td>
</tr>

<tr>
<td>zebkit.data</td>
<td>
The package provides number of classes and interfaces to represent simple data models like text, array, matrix, tree, etc.
</td>
</tr>

<tr>
<td>zebkit.layout</td>
<td>
The package provides number of layout manager that can be easily adapted to layout rectangular UI elements. Zebra UI is widely used to layout Rich UI components.
</td>
</tr>

<tr>
<td>zebkit.io</td>
<td>
The package contains number of classes, methods that are helpful to communicate to a remote HTTP, XML-RPC or JSON-RPC service.
</td>
</tr>

<tr>
<td>zebkit.draw</td>
<td>
The package provides number of renders and views that are able to draw different kind of objects: texts, shapes, images, etc.
</td>
</tr>

<tr>
<td>zebkit.ui<br/>zebkit.ui.grid<br/>zebkit.ui.tree<br/>zebkit.ui.design</td>
<td>
The packages provide huge amount of different abstract UI components that are supposed to be used to build Rich UI WEB application that are rendered on HTML Canvas element. Abstract means they are free from WEB specific what make possible porting it to other platforms and environments.
</td>
</tr>

<tr>
<td>zebkit.ui.event</td>
<td>
The package provide UI events related stuff.
</td>
</tr>

<tr>
<td>zebkit.web</td>
<td>
The package provides number of web specific classes and methods. 
</td>
</tr>

<tr>
<td>zebkit.ui.web</td>
<td>
The package provides implementations of required abstractions for WEB environment specifically.
</td>
</tr>

</table>


## Extra zebkit packages

There are number extension packages listed below. These packages are supplied in separate JavaScript files:   

<table class="info">
<tr><th>Package name</th><th>Description</th></tr>

<tr>
<td>zebkit.ui.date</td>
<td>
Calendar component package. 
</td>
</tr>

<tr>
<td>zebkit.ui.vk</td>
<td>
Virtual keyboard implementation.   
</td>
</tr>

</table>
