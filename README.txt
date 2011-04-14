/*
 * Directory layout:
 * extjs: symlink to specific version of ExtJS distribution
 * ext-*: versioned ext distribution
 * jsfb: js-file-browser source code
 *   data: Backend API code
 *   resources: CSS and images
 *   util: misc. functions
 *   widgets: UI code
 *   jsfb.js: application namespace setup.
 * jsfb-built: js-file-browser build code/distribution
 * index-built.html: example file browser for production
 * index.html: example file browser for development
 *
 */

/*
 * -----jsfb.jsb2------
 *
 * This file describes the build setup, but does not allow comments :(
 *
 * Build tool can be run with the following command:
 *
 * java -jar JSBuilder.jar -p irods.jsb2 -d irods-built
 *
 * Instructions can be found here: http://www.rahulsingla.com/blog/2010/12/extjs-custom-build-with-selected-components
 *
 * The 'JS File Browser' package contains all dependencies for this project.
 *
 * The following packages have been modified to eliminate un-needed code:
 * -- Ext All No Core
 * -- Ext All CSS No theme
 */
