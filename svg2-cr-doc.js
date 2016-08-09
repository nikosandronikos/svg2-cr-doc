function escapeXML(unsafe) {
    return unsafe.replace(/[<>&'"]/g, function (c) {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
        }
    });
}

function httpGetAsync(theUrl, callback, callback_data, page)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText, callback_data);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}

function output_issue_to_list(list, issue) {
    var li = document.createElement("li");
    li.setAttribute("id", "issue_"+issue.number);
    list.appendChild(li); 
   
    var link = document.createElement("a");
    link.setAttribute("href", "https://github.com/w3c/svgwg/issues/" + issue.number);
    link.setAttribute("class", "github-issue-link");
    link.innerHTML = issue.number;

    var issue_table = document.createElement("table");
    li.appendChild(issue_table);
    
    function output_issue_field(name, value) {
        var row = document.createElement("tr");
        var name_cell = document.createElement("td");
        var value_cell = document.createElement("td");

        name_cell.innerHTML = name;

        if (typeof value === 'string') {
            value_cell.innerHTML = escapeXML(value);
        } else {
            value_cell.appendChild(value);
        }

        issue_table.appendChild(row);
        row.appendChild(name_cell);
        row.appendChild(value_cell);
        //issue_table.innerHTML += name + ":" + ' '.repeat(10 - name.length) + value.toString()+"\n";
    }

    output_issue_field('Issue', link);
    output_issue_field('Summary', issue.title);
    output_issue_field('From', issue.user.login);

    var classes = [];
    var reply = "";
    var response = "";
    for (var label of issue.labels) {
        switch (label.name) {
            case "DoC_accepted":
                reply += "Accepted";
                classes.push(label.name);
                break;
            case "DoC_rejected":
                reply += "Rejected";
                classes.push(label.name);
                break;
            case "DoC_negativeResponse":
                response += " negative response";
                classes.push(label.name);
                break;
            case "DoC_positiveResponse":
                response += " positive response";
                classes.push(label.name);
                break;
            case "DoC_noResponse":
                response += " no response";
                classes.push(label.name);
                break;
        }
    }

    output_issue_field('Closed', reply + ' and ' + response);
    issue_table.setAttribute('class', classes.join(' '));
 }

function new_issue_list(chapter_container) {
    var list = document.createElement("ul");
    list.setAttribute("class", "table-body");
    chapter_container.appendChild(list);

    return list;
}

function output_list(issues) {
    var issue_list = new_issue_list(document.querySelector("#issues"));
    issue_list.setAttribute("class", "issue-list");

    for (var issue of issues) {
        output_issue_to_list(issue_list, issue);
    }
}

function display(issues) {
    issues.sort(function(a, b) {
        return a.number - b.number;
    });
    output_list(issues);
    document.querySelector("#loading").style.opacity = 0;
    document.querySelector("#issues").style.opacity = 1;
}

function get_json_issues(queries, query_num, prev_issues, page) {
   
    if (query_num === undefined) query_num = 0; 
    if (prev_issues === undefined) prev_issues = [];
    if (page === undefined) page = 1;

    console.log('getting issues with '+ queries[query_num] +', page ' + page);
    update_loading_message();

    httpGetAsync(
        'https://api.github.com/repos/w3c/svgwg/issues?state=all&direction=asc&'
        + queries[query_num]
        + '&page='
        + page,
        issue_json_received,
        {"queries": queries, "query_num": query_num, "prev_issues": prev_issues, "page": page}
    );
}

function issue_json_received(responseText, user_data) {

    update_loading_message();

    var queries = user_data.queries;
    var query_num = user_data.query_num;
    var prev_issues = user_data.prev_issues;
    var page = user_data.page;
    var issues = JSON.parse(responseText);
    if (issues.length > 0) {
        get_json_issues(queries, query_num, prev_issues.concat(issues), page + 1);
    } else if (query_num < queries.length - 1) {
        get_json_issues(queries, query_num + 1, prev_issues.concat(issues));
    } else {
        display(prev_issues);
    }
}

function update_loading_message() {
    var p = document.querySelector("#loading > #message");
    p.innerHTML = p.innerHTML + '.';
}

window.onload=function() {
    var queries = ["labels=DoC_accepted", "labels=DoC_rejected"];
    get_json_issues(queries);
}
    
