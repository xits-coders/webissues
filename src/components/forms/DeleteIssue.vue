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
  <div class="container-fluid">
    <FormHeader v-bind:title="$t( 'DeleteIssue.DeleteIssue' )" v-on:close="close"/>
    <Prompt path="DeleteIssue.DeleteIssuePrompt"><strong>{{ name }}</strong></Prompt>
    <Prompt path="DeleteIssue.DeleteIssueWarning" alert-class="alert-danger"><strong>{{ $t( 'DeleteIssue.Warning' ) }}</strong></Prompt>
    <FormButtons v-on:ok="submit" v-on:cancel="cancel"/>
  </div>
</template>

<script>
export default {
  props: {
    issueId: Number,
    name: String
  },

  methods: {
    submit() {
      this.$emit( 'block' );

      this.$ajax.post( '/server/api/issues/delete.php', { issueId: this.issueId } ).then( () => {
        this.$store.commit( 'list/setDirty' );
        this.close();
      } ).catch( error => {
        this.$emit( 'error', error );
      } );
    },

    cancel() {
      this.returnToDetails();
    },

    returnToDetails() {
      this.$router.push( 'IssueDetails', { issueId: this.issueId } );
    },

    close() {
      this.$emit( 'close' );
    }
  }
}
</script>
