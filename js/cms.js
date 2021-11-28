var titles = JSON.parse(titles);

function timeConverter(timestamp){
  var date = new Date(timestamp);
  var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return months[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();
}

/**
 * Time Complexity: O(n)
 *   - Traverse all nodes.
 * Space Complexity: O(h)
 *   - Tree height.
 */
function buildTable(data) {
  for (var i = 0; i < data.length; i++) {
    buildRow(data[i].title_id, null, null, data[i].title_name, data[i].content_type, data[i].seasons, data[i].episode_count, data[i].publish_timestamp);
  }
}

function buildRow(id, pid, gid, name, type, seasons, episodes, published, isLastS, isLastEP) {
  var template = $(".table--template").clone();
  template.find(".table__td--id").text(id);
  template.find(".table__td--title").text(name);
  template.find(".table__td--type").text(type);
  if (type == "Movie") {
    template.removeClass("table__tr--hide");
    template.find(".table__td--season").text("--");
    template.find(".table__td--episode").text("--");
  } else if (type == "Series") {
    template.removeClass("table__tr--hide");
    template.find(".table__td--season").text(seasons.length);
    template.find(".table__td--episode").text(episodes);
    template.find(".toggle__icon").addClass("toggle__icon--collapse").attr("src", "icon/collapse.png");
  } else if (type == "Season") {
    template.attr("pid", pid);
    template.find(".table__td--id").text("").attr("sid", id).addClass("table__td--sid");
    template.find(".table__td--title").text("").attr("stitle", name).addClass("table__td--stitle");
    template.find(".table__td--season").text(seasons);
    template.find(".table__td--episode").text(episodes.length);
    template.find(".toggle__icon").addClass("toggle__icon--plus").attr("src", "icon/plus.png");
    if (isLastS) {
      template.find(".table__td--first").addClass("table__line--season table__line--last-s");
    } else {
      template.find(".table__td--first").addClass("table__line--season");
    }
  } else if (type == "Episode") {
    template.attr("pid", pid);
    template.attr("gid", gid);
    template.find(".table__td--id").text("").attr("eid", id).addClass("table__td--eid");
    template.find(".table__td--title").text("").attr("etitle", name).addClass("table__td--etitle");
    template.find(".table__td--season").text("--");
    template.find(".table__td--episode").text(episodes);
    if (!isLastS) {
      template.find(".toggle__icon").addClass("table__line--ep1");
    }
    if (isLastEP) {
      template.find(".table__td--first").addClass("table__line--ep2 table__line--last-e");
    } else {
      template.find(".table__td--first").addClass("table__line--ep2");
    }
  }
  template.find(".table__td--published").text(timeConverter(published));
  template.removeClass("table--template");
  template.appendTo(".table__tbody");
  if (type == "Series" && seasons.length > 0) {
    for (var i = 0; i < seasons.length; i++) {
      buildRow(seasons[i].season_id, id, null, seasons[i].season_name, "Season", ("S" + seasons[i].season_number), seasons[i].episodes, seasons[i].publish_timestamp, (i == seasons.length - 1 ? true : false), null);
    }
  }
  if (type == "Season" && episodes.length > 0) {
    for (var i = 0; i < episodes.length; i++) {
      buildRow(episodes[i].episode_id, id, pid, episodes[i].episode_name, "Episode", null, ("EP" + episodes[i].episode_number), episodes[i].publish_timestamp, isLastS, (i == episodes.length - 1 ? true : false));
    }
  }
}
buildTable(titles);

$(".table").on("click", ".table__tr", function() {
  var $icon = $(this).find(".toggle__icon");
  if ($icon.hasClass("toggle__icon--collapse")) {
    var id = $(this).find(".table__td--id").text();
    $icon.addClass("toggle__icon--expand table__line--expand").removeClass("toggle__icon--collapse").attr("src", "icon/expand.png");
    $("[pid='" + id + "']").removeClass("table__tr--hide");
  } else if ($icon.hasClass("toggle__icon--expand")) {
    var id = $(this).find(".table__td--id").text();
    $icon.addClass("toggle__icon--collapse").removeClass("toggle__icon--expand table__line--expand").attr("src", "icon/collapse.png");
    $("[pid='" + id + "']").addClass("table__tr--hide").find(".toggle__icon").addClass("toggle__icon--plus").removeClass("toggle__icon--minus table__line--minus").attr("src", "icon/plus.png");
    $("[gid='" + id + "']").addClass("table__tr--hide");
  } else if ($icon.hasClass("toggle__icon--plus")) {
    var sid = $(this).find(".table__td--sid").attr("sid");
    $icon.addClass("toggle__icon--minus table__line--minus").removeClass("toggle__icon--plus").attr("src", "icon/minus.png");
    $("[pid='" + sid + "']").removeClass("table__tr--hide");
  } else if ($icon.hasClass("toggle__icon--minus")) {
    var sid = $(this).find(".table__td--sid").attr("sid");
    $icon.addClass("toggle__icon--plus").removeClass("toggle__icon--minus table__line--minus").attr("src", "icon/plus.png");
    $("[pid='" + sid + "']").addClass("table__tr--hide");
  }
});