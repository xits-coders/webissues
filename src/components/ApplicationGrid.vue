<!--
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
-->

<template>
  <Grid id="application-grid" v-bind:items="issues" v-bind:column-names="columnNames" v-bind:column-classes="columnClasses"
        sort-enabled v-bind:sort-column="sortColumnIndex" v-bind:sort-ascending="sortAscending"
        footer-visible v-bind:previous-enabled="previousEnabled" v-bind:next-enabled="nextEnabled"
        v-bind:status-text="statusText" v-bind:busy="busy" v-on:sort="sort" v-on:previous="previous" v-on:next="next"
        v-on:row-click="rowClick">
    <template slot-scope="{ item, columnIndex, columnClass }">
      <td v-if="isNameColumn( columnIndex )" v-bind:class="columnClass">
        <span v-if="item.read < item.stamp" v-bind:class="getUnreadClass( item )" aria-hidden="true"></span> {{ item.name }}
      </td>
      <td v-else-if="isLocationColumn( columnIndex )" v-bind:class="columnClass">{{ item.project }} &mdash; {{ item.folder }}</td>
      <td v-else-if="isUserColumn( columnIndex )" v-bind:class="columnClass" v-html="getUserCellValue( columnIndex, item )"></td>
      <td v-else v-bind:class="columnClass">{{ getCellValue( columnIndex, item ) }}</td>
    </template>
  </Grid>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

import { Column } from '@/constants'

export default {
  computed: {
    ...mapGetters( [ 'busy' ] ),
    ...mapState( 'list', [ 'sortColumn', 'sortAscending', 'columns', 'issues', 'totalCount' ] ),
    ...mapGetters( 'list', [ 'firstIndex', 'lastIndex' ] ),
    columnNames() {
      return this.columns.map( column => column.name );
    },
    columnClasses() {
      return this.columns.map( column => {
        if ( column.id == Column.ID )
          return 'column-id';
        else if ( column.id == Column.Name )
          return 'column-name';
        else if ( column.id == Column.Location )
          return 'column-location';
      } );
    },
    sortColumnIndex() {
      return this.columns.findIndex( c => c.id == this.sortColumn );
    },
    previousEnabled() {
      return this.firstIndex > 1;
    },
    nextEnabled() {
      return this.lastIndex < this.totalCount;
    },
    statusText() {
      if ( this.totalCount == 0 )
        return this.$t( 'ApplicationGrid.NoIssues' );
      else if ( this.firstIndex == 1 && this.lastIndex == this.totalCount )
        return this.$t( 'ApplicationGrid.IssuesCount', [ this.totalCount ] );
      else
        return this.$t( 'ApplicationGrid.IssuesCountOf', [ this.firstIndex, this.lastIndex, this.totalCount ] );
    }
  },

  methods: {
    isNameColumn( columnIndex ) {
      return this.columns[ columnIndex ].id == Column.Name;
    },
    isLocationColumn( columnIndex ) {
      return this.columns[ columnIndex ].id == Column.Location;
    },
    isUserColumn( columnIndex ) {
      return this.columns[ columnIndex ].id > Column.UserDefined;
    },

    getUnreadClass( issue ) {
      return [ 'fa', 'fa-circle', issue.read > 0 ? 'issue-modified' : 'issue-unread' ];
    },

    getCellValue( columnIndex, issue ) {
      const column = this.columns[ columnIndex ].id;
      switch ( column ) {
        case Column.ID:
          return '#' + issue.id;
        case Column.CreatedDate:
          return issue.createdDate;
        case Column.CreatedBy:
          return issue.createdBy;
        case Column.ModifiedDate:
          return issue.modifiedDate;
        case Column.ModifiedBy:
          return issue.modifiedBy;
      }
    },
    getUserCellValue( columnIndex, issue ) {
      const column = this.columns[ columnIndex ].id;
      return issue[ 'a' + ( column - Column.UserDefined ) ];
    },

    sort( columnIndex ) {
      this.$store.commit( 'list/setSortOrder', {
        sortColumn: this.columns[ columnIndex ].id,
        sortAscending: ( columnIndex == this.sortColumnIndex ) ? !this.sortAscending : true
      } );
      this.$store.dispatch( 'updateList' );
    },

    previous() {
      this.$store.commit( 'list/setPreviousPage' );
      this.$store.dispatch( 'updateList' );
    },
    next() {
      this.$store.commit( 'list/setNextPage' );
      this.$store.dispatch( 'updateList' );
    },

    rowClick( rowIndex ) {
      this.$router.push( 'IssueDetails', { issueId: this.issues[ rowIndex ].id } );
    }
  }
}
</script>
