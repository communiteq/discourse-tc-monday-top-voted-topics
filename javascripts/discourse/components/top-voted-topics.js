import Component from '@glimmer/component';
import { withPluginApi } from "discourse/lib/plugin-api"
import { tracked } from '@glimmer/tracking';
import { ajax } from "discourse/lib/ajax";

export default class TopVoted extends Component {
    @tracked mustShow = false;
    @tracked top_voted_topics = [];

    constructor() {
        super(...arguments);
        withPluginApi("0.3.0", (api) => {
            api.onPageChange((url, title) => {
                if ((url == "/") || url.startsWith('/?')) {
                    this.mustShow = true;
                } else {
                    this.mustShow = false;
                }
                if (this.mustShow) {
                    var category_id = settings.vote_category_id;
                    var tag_name = settings.vote_tag_name;

                    ajax(`/tags/c/vote_component/${category_id}/none/${tag_name}/l/latest.json?order=votes`).then((result) => {
                        this.top_voted_topics = result.topic_list.topics.slice(0, 3);
                    });
                }
            });
        });
    }

    get showComponent() {
        return this.mustShow;
    }
}
