import Controller from '@ember/controller';
import {action} from '@ember/object';
import {inject as service} from '@ember/service';
import {tracked} from '@glimmer/tracking';

export default class MembersActivityController extends Controller {
    @service router;
    @service store;

    queryParams = ['excludedEvents', 'member'];

    @tracked excludedEvents = null;
    @tracked member = null;

    get filter() {
        const filterParts = [];

        filterParts.push(this._getTypeFilter());
        filterParts.push(this._getMemberFilter());

        return filterParts.filter(p => !!p).join('+');
    }

    get memberRecord() {
        if (!this.member) {
            return null;
        }

        // TODO: {reload: true} here shouldn't be needed but without it
        // the template renders nothing if the record is already in the store
        return this.store.findRecord('member', this.member, {reload: true});
    }

    @action
    updateExcludedEvents(newList) {
        this.router.transitionTo({queryParams: {excludedEvents: newList}});
    }

    _getTypeFilter() {
        let excludedEvents = this.member ?
            new Set() :
            new Set(['email_opened_event', 'email_delivered_event', 'email_failed_event']);

        (this.excludedEvents || '').split(',').forEach(event => event && excludedEvents.add(event));

        if (excludedEvents.size > 0) {
            return `type:-[${Array.from(excludedEvents).join(',')}]`;
        } else {
            return;
        }
    }

    _getMemberFilter() {
        if (!this.member) {
            return;
        }

        return `data.member_id:${this.member}`;
    }
}