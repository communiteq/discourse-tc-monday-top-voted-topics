import Component from '@glimmer/component';
import { withPluginApi } from "discourse/lib/plugin-api"
import { tracked } from '@glimmer/tracking';
import { ajax } from "discourse/lib/ajax";
import { action } from '@ember/object'
import loadScript from "discourse/lib/load-script";
import { bind } from "discourse-common/utils/decorators"

export default class TopVoted extends Component {
    @tracked mustShow = false;
    @tracked top_voted_topics = [];
    index = 0;

    constructor() {
        super(...arguments);
        loadScript(settings.theme_uploads_local.flip).then(() => {
            //
        });
        withPluginApi("0.3.0", (api) => {
            api.onPageChange((url, title) => {
                if ((url == "/") || url.startsWith('/?')) {
                    this.mustShow = true;
                } else {
                    this.mustShow = false;
                }
                if (this.mustShow) {
                    var category_id = settings.vote_category_id;

                    ajax(`/c/vote_component/${category_id}.json?order=votes`).then((result) => {
                        const whitelist = settings.vote_tag_name.split(',');
                        const filteredTopics = result.topic_list.topics.filter((topic) => {
                            return topic.tags.some((tag) => whitelist.includes(tag));
                        });
                        this.top_voted_topics = filteredTopics.slice(0,3);
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
        const indicators = document.querySelectorAll('.top-voted-topics .circle-indicators .circle');
        indicators.forEach((indicator, idx) => {
            if (idx === index) {
                indicator.style.backgroundColor = '#6161ff';
                indicator.style.borderColor = '#6161ff';
            } else {
                indicator.style.backgroundColor = 'transparent';
                indicator.style.borderColor = '#676879';
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

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                  if (entry.isIntersecting) {
                    for (var i=0; i<3; i++) {
                        var el = document.querySelector(`#tick${i}`);
                        if (el) {
                            var tick = Tick.DOM.create(el, {
                                value: Math.floor(Math.random() * 100 + 100),
                                didInit: function(tick) {
                                    tick.value=el.getAttribute('data-count');
                                }
                            });
                        }
                    }
                }
            });
        });
        observer.observe(element);
    }
}
