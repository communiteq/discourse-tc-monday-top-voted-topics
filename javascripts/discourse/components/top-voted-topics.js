import Component from '@glimmer/component';
import { withPluginApi } from "discourse/lib/plugin-api"
import { tracked } from '@glimmer/tracking';
import { ajax } from "discourse/lib/ajax";
import { action } from '@ember/object'
import { bind } from "discourse-common/utils/decorators"

export default class TopVoted extends Component {
    @tracked mustShow = false;
    @tracked top_voted_topics = [];
    index = 0;

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

    updateSlides(index) {
        const slidesWrapper = document.querySelector('.top-voted-topics-list');
        const slideWidth = slidesWrapper.offsetWidth;
        slidesWrapper.scrollLeft = index * (slideWidth + 20) * 0.85;
    }

    updateIndicators(index) {
        this.index = index;
        const indicators = document.querySelectorAll('.circle');
        indicators.forEach((indicator, idx) => {
            if (idx === index) {
                indicator.style.backgroundColor = 'black';
            } else {
                indicator.style.backgroundColor = 'transparent';
            }
        });
      }

    @action
    selectSlide(event) {
        const target = event.target;
        const index = parseInt(target.dataset.index, 10);
        this.updateSlides(index);
        this.updateIndicators(index);
    }

    @action
    onComponentMount() {
        const element = document.querySelector('.top-voted-topics-list');
        element.addEventListener('scroll', (event) => {
          var idx = Math.max(Math.floor(event.target.scrollLeft / 250), 0);
          if (idx != this.index) {
              this.updateIndicators(idx);
          }
        });
    }
}
