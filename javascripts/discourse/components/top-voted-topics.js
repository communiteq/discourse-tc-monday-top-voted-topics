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
            this.router = api.container.lookup('service:router');
            api.onPageChange((url, title) => {
                var routeInfo = this.router.recognize(url);
                if ((routeInfo.name == 'tags.showCategory') || (routeInfo.name == 'discovery.category')) {
                    var param = routeInfo.params.category_slug_path_with_id || '';
                    if (param.startsWith('submit-an-idea')) {
                        this.mustShow = true;
                    } else {
                        this.mustShow = false;
                    }
                }
                else {
                    this.mustShow = false;
                }
                this.mustShow = true;
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
