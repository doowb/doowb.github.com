---
title: "Generating Config Files with Enquirer"
date: "2019-01-11 10:00:00"
layout: "post"
unsplashArgs: H7SCRwU1aiM
tags: ["generate", "enquirer"]
---

## Configuration files

As a developer, I work with configuration files for a lot of different applications, libraries, services, and tools. Sometimes these configuration files are simple JSON or YAML files that are created once when installing a tool or created when instantiating a project (like a [firebase.json](https://firebase.google.com/docs/cli/#the_firebasejson_file) file) and never touched again. Sometimes the configuration files are code files that determine how your project is built, like [generate](https://github.com/generate/generate), [assemble](https://github.com/assemble/assemble), or [gulp](https://gulpjs.com) files.

In my case, I've been working with [Kubernetes](https://kubernetes.io/) and wanted to create a [PostgreSQL](https://www.postgresql.org/) instance in my cluster. Using Kubernetes [Configuration Files](https://kubernetes.io/docs/concepts/overview/object-management-kubectl/declarative-config/) are a great way to create and delete resources quickly without a lot of manual commands. After creating some files once and creating a single PostgreSQL deployment, I realized it would be really easy to turn the files into templates to allow creating as many different instances as I wanted.

Below, I'll take you through the process of creating the template files and using [Enquirer](https://github.com/enquirer/enquirer) with [Generate](https://github.com/generate/generate) to create the Kubernetes configuration files and deploy them.

## Kubernetes Configuration Files

I won't go into details about setting up Kubernetes in this post since that's not the main focus. I already have a Kubernetes cluster setup on [DigitalOcean](https://m.do.co/c/47d2bfd5274c), but with a minor change, these files can be used on a Kubernetes cluster on any of the cloud providers or on premises at your company.

There are four configuration files that I used for creating a PostgreSQL instance as described below:

**config-map.yaml**

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: mypostgresql-config
  labels:
    app: mypostgresql
data:
  POSTGRES_DB: mypostgresqldb
  POSTGRES_USER: admin
  POSTGRES_PASSWORD: admin123
```

The `ConfigMap` above is a way to store a configuration in Kubernetes that will be used in other configuration files. This one specifically is storing the PostgreSQL database, username, and password for the admin. There are better ways to store secretes in Kubernetes, but that's for another post.

**storage.yaml**

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: mypostgresql-storage
  labels:
    app: mypostgresql
spec:
  storageClassName: do-block-storage
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
```

The storage file here is to tell Kubernetes to create a persistent storage volume that PostgreSQL will use to store data files. This is the only file that has a DigitalOcean specific setting, the `storageClassName: do-block-storage`. This is telling Kubernetes to talk to a DigitalOcean plugin that will create a DigitalOcean Volume (similar to AWS block storage).

**deployment.yaml**

```yaml
apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  name: mypostgresql
spec:
  replicas: 1
  template:
    metadata:
      labels:
        app: mypostgresql
    spec:
      containers:
        - name: postgres
          image: postgres:10.4
          imagePullPolicy: "IfNotPresent"
          ports:
            - containerPort: 5432
          envFrom:
            - configMapRef:
                name: mypostgresql-config
          volumeMounts:
            - mountPath: /var/lib/postgresql/data
              name: mypostgresqldb
              subPath: mypostgresqldb
      volumes:
        - name: mypostgresqldb
          persistentVolumeClaim:
            claimName: mypostgresql-storage
```

The deployment file is going to specify a Kubernetes deployment, which is where we specify which docker image to use (`postgres:10.4`) and any relevant settings and configuration for the docker containers to use. In `envFrom`, we're telling the image to get environment variables from the `mypostgresql-config` ConfigMap that we created above. We're also telling the containers to use the persistent volume that we created above.

With this deployment file, Kubernetes will try to ensure that an instance of the `postgres:10.4` image is always running as a Kubernetes pod. Since pods have a dynamically set name associated with them, we need a way to access them when they're created and restarted if one crashes. To do this we use a service.

**service.yaml**

```yaml
apiVersion: v1
kind: Service
metadata:
  name: mypostgresql
  labels:
    app: mypostgresql
spec:
  type: NodePort
  ports:
   - port: 5432
  selector:
   app: mypostgresql
```

This service file is telling Kubernetes to create a way for us to access any pods labelled with `mypostgresql` and which port to expose.

Now that the configuration files are created, to deploy to Kubernetes, I ran the following commands (these are assuming that an environment variable `$KUBECONFIG` is already set pointing to the kubectl config file with specifics on where my DigitalOcean cluster is deployed):

```sh
kubectl apply -f config-map.yaml
kubectl apply -f storage.yaml
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
```

This is all great but, then I wanted to create another PostgreSQL instance and would have to update the properties in the `.yaml` files. I immediately thought of turning the `.yaml` files into templates and wanted to use [enquirer](https://github.com/enquirer/enquirer) to gather the values I needed to populate the templates. I was pleasantly surprised when I started implementing the script at how easy it was to get working.

## Templating with enquirer

The first thing I had to do was convert my `.yaml` files into templates. Since I'm familiar with [Handlebars](https://handlebarsjs.com/), I quickly changed some values to template placeholders that I thought would be necessary to achieve what I wanted:

**config-map.hbs**

```hbs
apiVersion: v1
kind: ConfigMap
metadata:
  name: {{name}}-config
  labels:
    app: {{app}}
data:
  POSTGRES_DB: {{db}}
  POSTGRES_USER: {{user}}
  POSTGRES_PASSWORD: {{password}}
```

For the ConfigMap, I thought I would just name the config my generic name plus `-config`, and I needed an `app` name, and a `db`, `user`, and `password` for the database credentials. Simple enough.

**storage.hbs**

```hbs
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: {{storage}}
  labels:
    app: {{app}}
spec:
  storageClassName: do-block-storage
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: {{size}}Gi
```

For the storage file, I created a new variable called `storage` which is `${name}-storage` if built using a JavaScript template literal. I'm also reusing `app` from the previous file and a new `size` variable but hardcoding the size to be in gigs (`Gi`).

**deployment.hbs**

```hbs
apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  name: {{name}}
spec:
  replicas: 1
  template:
    metadata:
      labels:
        app: {{app}}
    spec:
      containers:
        - name: postgres
          image: postgres:10.4
          imagePullPolicy: "IfNotPresent"
          ports:
            - containerPort: 5432
          envFrom:
            - configMapRef:
                name: {{name}}-config
          volumeMounts:
            - mountPath: /var/lib/postgresql/data
              name: {{db}}
              subPath: {{db}}
      volumes:
        - name: {{db}}
          persistentVolumeClaim:
            claimName: {{storage}}
```

The deployment file is longer, but there aren't that many variables to configure. They're all actually from the previous files and just reused here: `name`, `app`, `db`, and `storage`.

**service.hbs**

```hbs
apiVersion: v1
kind: Service
metadata:
  name: {{name}}
  labels:
    app: {{app}}
spec:
  type: NodePort
  ports:
   - port: 5432
  selector:
   app: {{app}}
```

Finally, the service file just uses the `name` and `app` variables, which is easy enough.

## Collecting values

My initial thought was that I could use the [enquirer input prompt](https://github.com/enquirer/enquirer/#input-prompt) to ask the user for each variable: `name`, `app`, `storage`, `db`, `user`, `password`, and `size`. This is traditionally how CLI applications work and collect information. I feel that a downside to doing this way is that, as a user, I don't have the context to know how these variables will be used and if I'm using them in the correct way. For instance, `name` and `app` don't have to be different and I prefer making them the same.

Because of this, I grabbed the [enquirer snippet prompt](https://github.com/enquirer/enquirer/#snippet-prompt) instead. The snippet prompt will use the entire template string and allow users to fill in the values while they see where they go! The prompt also uses a syntax similar to Handlebars but, as of this writing, doesn't allow complex features like helpers, block helpers, and partials. However, it does have a couple of convenience features that make working with the prompt a little easier.

Here are the updated templates to use with the snippet prompt:

**config-map.hbs**

```hbs
apiVersion: v1
kind: ConfigMap
metadata:
  name: {{name}}-config
  labels:
    app: {{app:name}}
data:
  POSTGRES_DB: {{db}}
  POSTGRES_USER: {{user}}
  POSTGRES_PASSWORD: {{password}}
```

**deployment.hbs**

```hbs
apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  name: {{name}}
spec:
  replicas: 1
  template:
    metadata:
      labels:
        app: {{app:name}}
    spec:
      containers:
        - name: postgres
          image: postgres:10.4
          imagePullPolicy: "IfNotPresent"
          ports:
            - containerPort: 5432
          envFrom:
            - configMapRef:
                name: {{name}}-config
          volumeMounts:
            - mountPath: /var/lib/postgresql/data
              name: {{db}}
              subPath: {{db}}
      volumes:
        - name: {{db}}
          persistentVolumeClaim:
            claimName: {{storage}}
```

**service.hbs**

```hbs
apiVersion: v1
kind: Service
metadata:
  name: {{name}}
  labels:
    app: {{app:name}}
spec:
  type: NodePort
  ports:
   - port: 5432
  selector:
   app: {{app:name}}
```

In three of the templates we're just change the `{{app}}` template to `{{app:name}}`. This tells the snippet prompt to use the value of `name` for `app` unless the user types in their own value.

## JavaScript code

Now to the actual code! I'm going to use [generate](https://github.com/generate/generate) as a convenient way to run the code. Our file structure will look like this:

![File structure](/public/images/2019-01-11-file-structure.png)

The `templates` folder contains all of the Handlebars templates that we created above. We'll read these files in to supply to the snippet prompt to gather values and write out new `.yaml` files that can be used with `kubectl`.

**package.json**

```json
{
  "name": "my-database-configs",
  "version": "1.0.0",
  "homepage": "https://github.com/doowb/my-datbase-configs",
  "repository": "doowb/my-datbase-configs",
  "bugs": {
    "url": "https://github.com/doowb/my-datbase-configs/issues"
  },
  "license": "MIT",
  "engines": {
    "node": ">=10"
  },
  "keywords": [
    "generate",
    "enquirer",
    "kubernetes",
    "postgres",
    "postgresql"
  ],
  "devDependencies": {
    "enquirer": "^2.3.0"
  }
}
```

In our `package.json`, we only need the one dependency (`enquirer`) listed in `devDependencies`. We also need to install `generate` globally with the following command:

```sh
$ npm install --global generate
```

This gives us a `gen` command we can use in the command line.

Next, I'll show the `generator.js` file and comment inline to describe what this is doing.

**generator.js**

```js
'use strict';

/**
 * We need the `fs` and `path` module to read the templates from the filesystem
 * and write the YAML files back to the filesystem.
 */

const fs = require('fs');
const path = require('path');

/**
 * We only need the `prompt` method from `enquirer` since that will handle running multiple prompts and returning with a list of answers from each prompt.
 */

const { prompt } = require('enquirer');

/**
 * This `load` function is a convenient way to read in a directory of templates.
 * It just iterates over each filename in a directory (`dir`) and
 * adds the file contents to a property on the resulting object.
 *
 * We'll end up with an object like:
 * {
 *   'config-map': '<contents>',
 *   'deployment': '<contents>',
 *   'service': '<contents>',
 *   'storage': '<contents>'
 * }
 */

function load(dir) {
  let filenames = fs.readdirSync(dir);
  return filenames.reduce((acc, filename) => {
    let name = path.basename(filename, path.extname(filename));
    acc[name] = fs.readFileSync(path.join(dir, filename), 'utf8');
    return acc;
  }, {});
}

/**
 * Used later to write out the YAML files.
 */

function write(name, contents) {
  fs.writeFileSync(name, contents);
}

/**
 * This `snippet` function creates a prompt options object that's used with the
 * `prompt` function that's exported from `enquirer`.
 * This object will specify the `snippet` prompt for the `type`.
 *
 * This also takes care of creating a `template` function that will get the template
 * from the `templates` object created with the `load` function. This tells the
 * snippet prompt what to render and which values to collect.
 *
 * Finally, we're using a `defaults` object that's set on the `initial` property.
 * This allows us to update the `defaults` properties to be used in other prompts
 * so the user only has to provide the value once for the same property.
 */

function snippet(templates, name, options = {}, defaults = {}) {
  let opts = Object.assign({ type: 'snippet', name }, options);
  return {
    type: opts.type,
    name: opts.name,
    message: opts.message,
    template: () => templates[name],
    initial: defaults
  };
}

/**
 * The main exports is a function that takes an instance of Generate as `app`.
 * This is the standard syntax for using Generate.
 */

module.exports = app => {

  /**
   * The `default` task is where all of the work is done for prompting the user
   * and writing out the generated yaml files.
   */

  app.task('default', async () => {

    // First, load all of the templates and store them on a `templates` object.
    let templates = await load(path.join(__dirname, 'templates'));

    // The `defaults` object is what's used to supply the prompts with initial values.
    let defaults = {};

    // when we get the app name the first time, store it for later use
    let appname;

    // Here, we're telling the prompt to update the `defaults` object with
    // the results of the user answering the prompts.
    prompt.on('answer', (name, results) => {

      // Object.assign is used here so the reference to `defaults` isn't broken.
      Object.assign(defaults, results.values);

      // only after the `config-map` template is filled in should we create
      // a `storage` property based on the `.name` value.
      if (name === 'config-map') {
        appname = defaults.name
        defaults.storage = `${appname}-storage`;
      }
    });

    // Now we're going to create 4 prompt options objects (one for each template)
    // to prompt the user to fill in the templates.
    let answers = await prompt([
      snippet(templates, 'config-map', { message: 'Database configuration'}, defaults),
      snippet(templates, 'storage', { message: 'Data storage configuration'}, defaults),
      snippet(templates, 'deployment', { message: 'Deployment configuration' }, defaults),
      snippet(templates, 'service', { message: 'Service configuration' }, defaults)
    ]);

    // finally, we write out each YAML file based on the user provided `name`
    // and the name of the template file.
    write(`${appname}-config-map.yaml`, answers['config-map'].result);
    write(`${appname}-storage.yaml`, answers['storage'].result);
    write(`${appname}-deployment.yaml`, answers['deployment'].result);
    write(`${appname}-service.yaml`, answers['service'].result);
  });
};
```

Now from the command line run:

```sh
$ gen
```

This will start the default generator from `generator.js` and start prompting you to fill in the template files. If you name your `app` "mypostgres", then the four files you'll end up with are:

```sh
mypostgres-config-map.yaml
mypostgres-deployment.yaml
mypostgres-service.yaml
mypostgres-storage.yaml
```

You can now run the following `kubectl` commands to deploy them to your cluster:

```sh
kubectl apply -f mypostgres-config-map.yaml
kubectl apply -f mypostgres-storage.yaml
kubectl apply -f mypostgres-deployment.yaml
kubectl apply -f mypostgres-service.yaml
```

## Wrapping it up

This post went from starting with a few hardcoded Kubernetes configuration files to being able to generate any number of configuration files from user supplied input. By combining a few tools (templates, enquirer, and generate), we're able to create powerful command line apps that help make developers more productive while producing less bugs.

If you haven't already, please check out [generate](https://github.com/generate/generate) and [enquirer](https://github.com/enquirer/enquirer) to learn about more powerful features they over. Also, subscribe to my newsletter and follow me on [twitter](https://twitter/doowb) and [GitHub](https://github.com/doowb) to be notified of new blog posts.
