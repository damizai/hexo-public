window.CommentManager = {
    article: null,
    commentCache: new Map,
    async fetchData(e, t, a) {
        const i = JSON.stringify({
            options: e,
            type: t,
            exclude: a
        });
        if (this.commentCache.has(i))
            return this.commentCache.get(i);
        try {
            const n = await fetch("https://weilai.us.kg", {
                method: "POST",
                body: JSON.stringify({
                    event: "GET_RECENT_COMMENTS",
                    accessToken: "73379704eedb437ba4f2f9774ba8cdf0",
                    includeReply: !0,
                    ...e
                }),
                headers: {
                    "Content-Type": "application/json"
                }
            })
              , {data: r} = await n.json()
              , s = this.filterData(r, t, a)
              , c = this.generateHTML(s, t);
            return this.commentCache.set(i, c),
            c
        } catch (e) {
            return console.error("获取评论出错:", e),
            "<p>加载评论时出错，请稍后再试。</p>"
        }
    },
    filterData(e, t, a) {
        const i = {
            visitor: e => e.mailMd5 === a,
            "v-shield": e => e.mailMd5 !== a,
            "a-shield": e => !e.url.includes(a),
            "a-show": e => e.url.includes(a)
        };
        return e.filter(i[t] || ( () => !0))
    },
    generateHTML(e, t) {
        return 0 === e.length ? "<p>没有找到相关评论。</p>" : e.map(this.generateCommentCard.bind(this, t)).join("")
    },
    generateCommentCard(e, t) {
        const a = new Date(t.created)
          , i = `${a.getFullYear().toString().slice(-2)}-${a.getMonth() + 1}-${a.getDate()} ${a.getHours()}:${a.getMinutes()}:${a.getSeconds()}`
          , n = this.getArticleTitle(t.url);
        return `\n            <div class="comment-card">\n                <div class="avatar-wrapper" style="background-image: url('${t.avatar}');"></div>\n                <div class="comment-info">\n                    <div class="comment-information">\n                        <span class="comment-user" data-mailMd5="${t.mailMd5}">\n                            ${t.nick}\n                            ${"东方月初" === t.nick ? '<i class="fa fa-check-circle" style="color: var(--anzhiyu-main); margin-left: 5px;"></i>' : ""}\n                        </span>\n                        <span class="comment-time">${i}</span>\n                    </div>\n                </div>\n                <div class="comment-content">${this.escapeHtml(t.commentText)}</div>\n                <div class="comment-more">\n                    <div class="comment-title">\n                        <span class="comment-link" onclick="pjax.loadUrl('${t.url}')" title="查看此文章" data-url="${t.url}">\n                            <i class="fa fa-book"></i>\n                            ${n}\n                        </span>\n                        <a data-action="view-comment" data-url="${t.url}" data-id="${t.id}">查看评论</a>\n                    </div>\n                    <div class="comment-tool">\n                        ${this.generateCommentTools(e, t)}\n                    </div>\n                </div>\n            </div>\n        `
    },
    escapeHtml: e => e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;"),
    generateCommentTools(e, t) {
        const a = {
            view_more: '<a data-action="view-more">查看更多</a>',
            shield_article: '<a data-action="shield-article">屏蔽文章</a>',
            shield_user: '<a data-action="shield-user">屏蔽Ta</a>',
            view_user: '<a data-action="view-user-comments">查看Ta更多评论</a>',
            return: '<a data-action="return-comments">返回评论</a>'
        }
          , i = {
            article: ["shield_user", "view_user", "return"],
            visitor: ["return", "view_more", "shield_article"],
            "v-shield": ["view_more", "shield_article", "shield_user", "view_user", "return"],
            "a-shield": ["view_more", "shield_article", "shield_user", "view_user", "return"],
            "a-show": ["return", "shield_article"],
            default: ["view_more", "shield_article", "shield_user", "view_user"]
        };
        return (i[e] || i.default).map((e => a[e])).join("")
    },
    getArticleTitle(e) {
        if (!this.article || !this.article.post || !this.article.page)
            return "未知文章";
        const t = e.replace(/^https?:\/\/[^\/]+/, "")
          , a = this.article.post.find((e => e.link === t))
          , i = this.article.page.find((e => e.link === t));
        return a ? a.title : i ? i.title : "未知文章"
    },
    async handleAction(e, t) {
        const a = t.closest(".comment-card")
          , i = a.querySelector(".comment-link").getAttribute("data-url")
          , n = a.querySelector(".comment-user").getAttribute("data-mailMd5");
        let r;
        switch (e) {
        case "view-comment":
            const e = t.getAttribute("data-id");
            return void pjax.loadUrl(`${i}#${e}`);
        case "shield-user":
            r = await this.fetchData({
                pageSize: -1
            }, "v-shield", n);
            break;
        case "view-user-comments":
            r = await this.fetchData({
                pageSize: -1
            }, "visitor", n);
            break;
        case "return-comments":
            r = await this.fetchData({
                pageSize: 100
            });
            break;
        case "view-more":
            r = await this.fetchData({
                pageSize: -1
            }, "a-show", i);
            break;
        case "shield-article":
            r = await this.fetchData({
                pageSize: -1
            }, "a-shield", i)
        }
        document.getElementById("comments-page").innerHTML = r
    },
    async loadArticleData() {
        if (this.article)
            return this.article;
        try {
            const e = await fetch("/article.json")
              , t = await e.json();
            return this.article = t && t.post && t.page ? t : {
                post: [],
                page: []
            },
            this.article
        } catch (e) {
            return console.error("加载文章数据出错:", e),
            {
                post: [],
                page: []
            }
        }
    },
    async init() {
        const e = document.querySelector("#comments-page");
        if (e) {
            await this.loadArticleData();
            const t = await this.fetchData({
                pageSize: 100
            });
            e.innerHTML = t,
            e.addEventListener("click", (async e => {
                const t = e.target;
                "A" === t.tagName && t.hasAttribute("data-action") && (e.preventDefault(),
                await this.handleAction(t.getAttribute("data-action"), t))
            }
            ))
        }
    }
},
window.addEventListener("load", ( () => CommentManager.init())),
document.addEventListener("pjax:complete", ( () => CommentManager.init()));
//# sourceMappingURL=../../maps/static/messages/messages.js.map
