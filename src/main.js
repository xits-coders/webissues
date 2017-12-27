/**************************************************************************
* This file is part of the WebIssues Server program
* Copyright (C) 2006 Michał Męciński
* Copyright (C) 2007-2017 WebIssues Team
*
* This program is free software: you can redistribute it and/or modify
* it under the terms of the GNU Affero General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU Affero General Public License for more details.
*
* You should have received a copy of the GNU Affero General Public License
* along with this program.  If not, see <http://www.gnu.org/licenses/>.
**************************************************************************/

import 'babel-polyfill'
import 'whatwg-fetch'

import Vue from 'vue'

import '@/styles/global.less'

import Application from '@/components/Application'

import BusyOverlay from '@/components/common/BusyOverlay.vue'
import DropdownButton from '@/components/common/DropdownButton.vue'
import FormButtons from '@/components/common/FormButtons.vue'
import FormGroup from '@/components/common/FormGroup.vue'
import FormHeader from '@/components/common/FormHeader.vue'
import Grid from '@/components/common/Grid.vue'
import Link from '@/components/common/Link.vue'
import Prompt from '@/components/common/Prompt.vue'

import makeAjax from '@/services/ajax'
import makeRouter from '@/services/router'

import makeI18n from '@/i18n';
import makeStore from '@/store'

import applicationRoutes from '@/routes/application'
import makeIssueRoutes from '@/routes/issue'

let app = null;

export function main( { baseURL, csrfToken, locale, ...initialState } ) {
  if ( app )
    throw new Error( 'Application already initialized' );

  if ( process.env.NODE_ENV == 'production' )
    __webpack_public_path__ = baseURL + '/assets/';

  const i18n = makeI18n( locale );

  const ajax = makeAjax( baseURL, csrfToken );

  const router = makeRouter( [
    applicationRoutes,
    makeIssueRoutes( ajax )
  ] );

  const store = makeStore( baseURL, initialState, ajax, router );

  registerComponents( {
    BusyOverlay,
    DropdownButton,
    FormButtons,
    FormGroup,
    FormHeader,
    Grid,
    Link,
    Prompt
  } );

  app = new Vue( {
    i18n,
    ajax,
    store,
    router,
    el: '#application',
    render( createElement ) {
      return createElement( Application );
    }
  } );

  if ( process.env.NODE_ENV != 'production' && module.hot != null ) {
    module.hot.accept( [ '@/routes/application', '@/routes/issue' ], () => {
      router.hotUpdate( [
        applicationRoutes,
        makeIssueRoutes( ajax )
      ] );
    } );
  }
}

function registerComponents( components ) {
  for ( const name in components ) {
    if ( components.hasOwnProperty( name ) )
      Vue.component( name, components[ name ] );
  }
}
