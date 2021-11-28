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

function processTitle(name) {
  return name.length > 80 ? name.substring(0, 80) + "..." : name;
}

function buildRow(id, pid, gid, name, type, seasons, episodes, published, isLastS, isLastEP) {
  var template = $(".table--template").clone();
  template.find(".table__td--id").text(id);
  template.find(".table__td--title").text(processTitle(name));
  template.find(".table__td--type").text(type);
  if (type == "Movie") {
    template.removeClass("table__tr--hide");
    template.find(".table__td--season").text("--");
    template.find(".table__td--episode").text("--");
    template.find(".program__text").addClass("program__text--movie");
  } else if (type == "Series") {
    template.removeClass("table__tr--hide");
    template.find(".table__td--season").text(seasons.length);
    template.find(".table__td--episode").text(episodes);
    template.find(".table__td--id").attr("rid", id);
    template.find(".toggle__icon").addClass("toggle__icon--collapse");
    template.find(".program__text").addClass("program__text--season");
  } else if (type == "Season") {
    template.attr("pid", pid);
    template.find(".table__td--id").text("").attr("sid", id).addClass("table__td--sid");
    template.find(".table__td--title").text("").attr("stitle", processTitle(name)).addClass("table__td--stitle");
    template.find(".table__td--season").text(seasons);
    template.find(".table__td--episode").text(episodes.length);
    template.find(".toggle__icon").addClass("toggle__icon--plus");
    if (isLastS) {
      template.find(".table__td--first").addClass("table__line--season table__line--last-s");
    } else {
      template.find(".table__td--first").addClass("table__line--season");
    }
    template.find(".program__text").addClass("program__text--eps");
  } else if (type == "Episode") {
    template.attr("pid", pid);
    template.attr("gid", gid);
    template.find(".table__td--id").text("").attr("eid", id).addClass("table__td--eid");
    template.find(".table__td--title").text("").attr("etitle", processTitle(name)).addClass("table__td--etitle");
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
    template.find(".program__text").addClass("program__text--ep");
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

jQuery.expr[':'].contains = function(a, i, m) {
  return jQuery(a).text().toUpperCase()
      .indexOf(m[3].toUpperCase()) >= 0;
};

$(".table").on("click", ".table__tr", function() {
  var $icon = $(this).find(".toggle__icon");
  if ($icon.hasClass("toggle__icon--collapse")) {
    var id = $(this).find(".table__td--id").text();
    $icon.addClass("toggle__icon--expand table__line--expand").removeClass("toggle__icon--collapse");
    $("[pid='" + id + "']").show(500);
  } else if ($icon.hasClass("toggle__icon--expand")) {
    var id = $(this).find(".table__td--id").text();
    $icon.addClass("toggle__icon--collapse").removeClass("toggle__icon--expand table__line--expand");
    $("[pid='" + id + "']").hide(500);
    $("[gid='" + id + "']").hide(500);
    setTimeout(function() {
      $("[pid='" + id + "']").find(".toggle__icon").addClass("toggle__icon--plus").removeClass("toggle__icon--minus table__line--minus");
    }, 500);
  } else if ($icon.hasClass("toggle__icon--plus")) {
    var sid = $(this).find(".table__td--sid").attr("sid");
    $icon.addClass("toggle__icon--minus table__line--minus").removeClass("toggle__icon--plus");
    $("[pid='" + sid + "']").show(500);
  } else if ($icon.hasClass("toggle__icon--minus")) {
    var sid = $(this).find(".table__td--sid").attr("sid");
    $icon.addClass("toggle__icon--plus").removeClass("toggle__icon--minus table__line--minus");
    $("[pid='" + sid + "']").hide(500);
  }
});


$(".table").on("click", ".program__icon", function(e) {
  e.stopPropagation();
  var $icon = $(this);
  var $type = $(this).next();

  if ($type.hasClass("program__text--movie")) {
    if ($icon.hasClass("program__icon--on")) {
      $icon.removeClass("program__icon--on").addClass("program__icon--off");
    } else {
      $icon.removeClass("program__icon--off").addClass("program__icon--on");
    }
  } else if ($type.hasClass("program__text--season")) {
    var id = $icon.parent().siblings(".table__td--id").text();

    if ($icon.hasClass("program__icon--on")) {
      $icon.removeClass("program__icon--on").addClass("program__icon--off");
      $("[pid='" + id + "']").find(".program__icon").removeClass("program__icon--on").addClass("program__icon--off");
      $("[gid='" + id + "']").find(".program__icon").removeClass("program__icon--on").addClass("program__icon--off");
    } else {
      $icon.removeClass("program__icon--off").addClass("program__icon--on");
      $("[pid='" + id + "']").find(".program__icon").removeClass("program__icon--off").addClass("program__icon--on");
      $("[gid='" + id + "']").find(".program__icon").removeClass("program__icon--off").addClass("program__icon--on");
    }
  } else if ($type.hasClass("program__text--eps")) {
    var sid = $icon.parent().siblings(".table__td--sid").attr("sid");
    if ($icon.hasClass("program__icon--on")) {
      $icon.removeClass("program__icon--on").addClass("program__icon--off");
      $("[pid='" + sid + "']").find(".program__icon").removeClass("program__icon--on").addClass("program__icon--off");
    } else {
      var $tr = $icon.parent().parent();
      var pid = $tr.attr("pid");
      $icon.removeClass("program__icon--off").addClass("program__icon--on");
      $("[pid='" + sid + "']").find(".program__icon").removeClass("program__icon--off").addClass("program__icon--on");
      if ($("[rid='" + pid + "']").parent().find(".program__icon").hasClass("program__icon--off")) {
        $("[rid='" + pid + "']").parent().find(".program__icon").removeClass("program__icon--off").addClass("program__icon--on");
      }
    }
  } else if ($type.hasClass("program__text--ep")) {
    if ($icon.hasClass("program__icon--on")) {
      $icon.removeClass("program__icon--on").addClass("program__icon--off");
    } else {
      var $tr = $icon.parent().parent();
      var pid = $tr.attr("pid");
      var gid = $tr.attr("gid");
      $icon.removeClass("program__icon--off").addClass("program__icon--on");
      if ($("[sid='" + pid + "']").parent().find(".program__icon").hasClass("program__icon--off")) {
        $("[sid='" + pid + "']").parent().find(".program__icon").removeClass("program__icon--off").addClass("program__icon--on");
      }
      if ($("[rid='" + gid + "']").parent().find(".program__icon").hasClass("program__icon--off")) {
        $("[rid='" + gid + "']").parent().find(".program__icon").removeClass("program__icon--off").addClass("program__icon--on");
      }
    }
  }
});

$(".search__input").on("input", function() {
	var search = $(this).val();
	if (search !== "") {
		$("tbody>tr").hide();
		$("td:contains('" + search + "')").show();
		$("td[sid*='" + search + "']").parent().show();
		$("td[stitle*='" + search + "']").parent().show();
		$("td[eid*='" + search + "']").parent().show();
		$("td[etitle*='" + search + "']").parent().show();
	} else {
		$("tbody>tr").show();
		$("[pid]").hide();
		$("[gid]").hide();
		$(".table--template").hide();
	}
});

buildTable(titles);