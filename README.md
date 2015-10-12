# 〇.js
A light framework. Because everyone should have one.

## What this is all about?

〇 was written with three things in mind -
* Learning by experience, which I encourage anyone to do
* Having a framework doing exactly what I need, and I know how it's being done
* Having a framework's design as I believe it should, keeping things simple, and avoiding the mix of structure and style.

I believe in clear separation between code (Javascript), structure (HTML) and style (CSS).
Having this distinction means the code can easily be replaced with having minimum change in the structure and the style, and vice versa.
This means the code shouldn't dictate which tag is being used and all relevant style alternation are via classes that have a "js-" prefix.

## What does it include?

* A mustache-like template-engine!
* Quick access to DOM elements that have an ID
* Batch manipulation on queried DOM elements
* AJAX calls
* Event handling and dispatching

Read the complete documentation [online](http://odedshr.github.io/o.js/) for all the wonderful features.

## How to use the template engine?

* **Simple example: Hello World!**
  Rendering the `template Hello {{name}}` with the data `{name:'World'}` will result the string Hello World.
* **When data is an object**
  Data may contain an object, for example `{user:{name:'World'}}`, in which case the template should specify `Hello {{user.name}}`.
* **When data is a function**
  Data may contain a function, for example `{name: function () { return 'world'}}`, but this will be automatically identified, so the template will remain `Hello {{name}}`.
* **Conditionals**
  Conditionals allow hiding some of the template according to a variable. for example: `Hello {{?showName}}{{name}}{{/showName}} `where showName can either be a boolean or a function returning a boolean. `Hello {{?!showName}}no name provided{{/showName}}` will show 'no name provided' ONLY if show equals false.
* **Shortcut to Object's sub-variables in the data**
  When data contain an object, it is possible to easily access Object's properties using '@', for example: `{{@user}}{{fName}} {{lName}}{{/user}}` is equal to `{{user.fName}} {{user.lName}}`.
* **Iterating arrays in the data**
  It is possible to iterate arrays in the data using the loop {{item@group}}, for example: `{{user@users}} {{name}} {{/user@users}}`. Note this means the data should look like `{users:{user:[{name:'John'},{name:'David'}]}}`. You may define a counter by appending to the prefix tag ':' and the name of the new variable, for example: `{{item@group:_idx}} {{_idx}} {{/item@group}}`. Please note the counter doesn't appear at the closing tag.
* **Sub-templates**
  A template may refer to another template using the syntax data:template, for example `{{user:userTemplate}}`. In our example, the user will be sent as data for the userTemplate.
* **using 'this'**
  Sometime you might want to retrieve the entire data. This can be done using '.'. For example, when our data contains an array of strings - `{fruits:{fruit:['orange','apple','melon']}}` you may print the list using the iteration command `{{fruit@fruits}} {{.}}, {{/fruit@fruits}}`
* **Updating delimiters**
  If you template contains the string '{{' (or '}}') you might want to temporarily replace the delimiters. You can do so with the `'{{'startTag','endTag'}} ... '{{/'startTag','endTag'}}`, for example `{{'<?','?>'}}Hello <?name?>{{/'<?','?>'}}`
* **Translation**
  It is advised that strings shouldn't be hard-coded in your structure, rather the variables that can be translates. This can easily be done using '#string.code', for example `{{#label.hello}}}`. The string code is comprised with two elements, separated by a '.': context and default-value. The context is meant to help you know where and how the string is used; default-value is the string that appear in case the current locale doesn't contain the string-code. It is worth to emphasize that the translation files include the full string code (in our example label.hello). The default value begins after the first '.' and may contain any character (including spaces).
* Order of rendering
  Let's look at this sample-data `{{main:{isVisible:true,sub:{isVisible:false}}}}` and the template `{{@sub}}{{?isVisible}}Hello!{{/isVisible}}{{/sub}}`. the variable that will be checked is sub.isVisible (and not main.isVisible). This means the order or parsing the template is crucial. It follows this logic - Replace delimiters where needed Handle with sub-variables Handle with iterations Filter out elements according to conditionals Replace variables Translate string It is important to note that each sub-section will go through the entire process before combining all elements together (meaning part-i will be translated before part-ii will iterate its loop


## Still unclear?

I hope you find it useful, if you have any questions/feedbacks/comments or requests, please don't hesitate to [email](mailto:odedshr@gmail.com) me.

## Acknowledgements

This piece of code is under "[The MIT License](http://opensource.org/licenses/MIT "What is MIT license?")", meaning you can do whatever you want with it. it's free, as all intellectual property should be. Enjoy.