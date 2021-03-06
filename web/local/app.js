"use strict";
// Prevent compiler errors when using jQuery.  "$" will be given a type of 
// "any", so that we can use it anywhere, and assume it has any fields or
// methods, without the compiler producing an error.
var $;
// The 'this' keyword does not behave in JavaScript/TypeScript like it does in
// Java.  Since there is only one NewEntryForm, we will save it to a global, so
// that we can reference it from methods of the NewEntryForm in situations where
// 'this' won't work correctly.
var newEntryForm;
// This constant indicates the path to our backend server (change to your own)
var backendUrl = "https://mysterious-sierra-44770.herokuapp.com";
/**
 * NewEntryForm encapsulates all of the code for the form for adding an entry
 */
var NewEntryForm = /** @class */ (function () {
    /**
     * To initialize the object, we say what method of NewEntryForm should be
     * run in response to each of the form's buttons being clicked.
     */
    function NewEntryForm() {
        $("#addCancel").click(this.clearForm);
        $("#addButton").click(this.submitForm);
    }
    /**
     * Clear the form's input fields
     */
    NewEntryForm.prototype.clearForm = function () {
        $("#newTitle").val("");
        $("#newMessage").val("");
        // reset the UI
        $("#addElement").hide();
        $("#editElement").hide();
        $("#showElements").show();
    };
    /**
     * Check if the input fields are both valid, and if so, do an AJAX call.
     */
    NewEntryForm.prototype.submitForm = function () {
        // get the values of the two fields, force them to be strings, and check 
        // that neither is empty
        var title = "" + $("#newTitle").val();
        var msg = "" + $("#newMessage").val();
        if (title === "" || msg === "") {
            window.alert("Error: title or message is not valid");
            return;
        }
        // set up an AJAX post.  When the server replies, the result will go to
        // onSubmitResponse
        $.ajax({
            type: "POST",
            // url: "/messages",
            url: backendUrl + "/messages",
            dataType: "json",
            data: JSON.stringify({ mTitle: title, mMessage: msg }),
            success: newEntryForm.onSubmitResponse
        });
    };
    /**
     * onSubmitResponse runs when the AJAX call in submitForm() returns a
     * result.
     *
     * @param data The object returned by the server
     */
    NewEntryForm.prototype.onSubmitResponse = function (data) {
        // If we get an "ok" message, clear the form
        if (data.mStatus === "ok") {
            newEntryForm.clearForm();
            mainList.refresh();
        }
        // Handle explicit errors with a detailed popup message
        else if (data.mStatus === "error") {
            window.alert("The server replied with an error:\n" + data.mMessage);
        }
        // Handle other errors with a less-detailed popup message
        else {
            window.alert("Unspecified error");
        }
    };
    return NewEntryForm;
}()); // end class NewEntryForm
// a global for the main ElementList of the program.  See newEntryForm for 
// explanation
var mainList;
/**
 * ElementList provides a way of seeing all of the data stored on the server.
 */
var ElementList = /** @class */ (function () {
    function ElementList() {
    }
    /**
     * refresh is the public method for updating messageList
     */
    ElementList.prototype.refresh = function () {
        // Issue a GET, and then pass the result to update()
        $.ajax({
            type: "GET",
            // url: "/messages",
            url: backendUrl + "/messages",
            dataType: "json",
            success: mainList.update
        });
    };
    /**
     * update is the private method used by refresh() to update messageList
     */
    ElementList.prototype.update = function (data) {
        $("#messageList").html("<table>");
        for (var i = 0; i < data.mData.length; ++i) {
            $("#messageList").append("<tr><td>" + data.mData[i].mTitle +
                "</td>" + mainList.buttons(data.mData[i].mId) + "</tr>");
        }
        $("#messageList").append("</table>");
        // Find all of the delete buttons, and set their behavior
        $(".delbtn").click(mainList.clickDelete);
        // Find all of the Edit buttons, and set their behavior
        $(".editbtn").click(mainList.clickEdit);
    };
    /**
    * buttons() adds a 'delete' button and an 'edit' button to the HTML for each
    * row
    */
    ElementList.prototype.buttons = function (id) {
        return "<td><button class='editbtn' data-value='" + id
            + "'>Edit</button></td>"
            + "<td><button class='delbtn' data-value='" + id
            + "'>Delete</button></td>";
    };
    /**
    * clickDelete is the code we run in response to a click of a delete button
    */
    ElementList.prototype.clickDelete = function () {
        // for now, just print the ID that goes along with the data in the row
        // whose "delete" button was clicked
        var id = $(this).data("value");
        $.ajax({
            type: "DELETE",
            // url: "/messages/" + id,
            url: backendUrl + "/messages",
            dataType: "json",
            // TODO: we should really have a function that looks at the return
            //       value and possibly prints an error message.
            success: mainList.refresh
        });
    };
    /**
    * clickEdit is the code we run in response to a click of a delete button
    */
    ElementList.prototype.clickEdit = function () {
        // as in clickDelete, we need the ID of the row
        var id = $(this).data("value");
        $.ajax({
            type: "GET",
            // url: "/messages/" + id,
            url: backendUrl + "/messages",
            dataType: "json",
            success: editEntryForm.init
        });
    };
    return ElementList;
}()); // end class ElementList
// a global for the EditEntryForm of the program.  See newEntryForm for 
// explanation
var editEntryForm;
/**
 * EditEntryForm encapsulates all of the code for the form for editing an entry
 */
var EditEntryForm = /** @class */ (function () {
    /**
     * To initialize the object, we say what method of EditEntryForm should be
     * run in response to each of the form's buttons being clicked.
     */
    function EditEntryForm() {
        $("#editCancel").click(this.clearForm);
        $("#editButton").click(this.submitForm);
    }
    /**
     * init() is called from an AJAX GET, and should populate the form if and
     * only if the GET did not have an error
     */
    EditEntryForm.prototype.init = function (data) {
        if (data.mStatus === "ok") {
            $("#editTitle").val(data.mData.mTitle);
            $("#editMessage").val(data.mData.mContent);
            $("#editId").val(data.mData.mId);
            $("#editCreated").text(data.mData.mCreated);
            // show the edit form
            $("#addElement").hide();
            $("#editElement").show();
            $("#showElements").hide();
        }
        else if (data.mStatus === "error") {
            window.alert("Error: " + data.mMessage);
        }
        else {
            window.alert("An unspecified error occurred");
        }
    };
    /**
     * Clear the form's input fields
     */
    EditEntryForm.prototype.clearForm = function () {
        $("#editTitle").val("");
        $("#editMessage").val("");
        $("#editId").val("");
        $("#editCreated").text("");
        // reset the UI
        $("#addElement").hide();
        $("#editElement").hide();
        $("#showElements").show();
    };
    /**
     * Check if the input fields are both valid, and if so, do an AJAX call.
     */
    EditEntryForm.prototype.submitForm = function () {
        // get the values of the two fields, force them to be strings, and check 
        // that neither is empty
        var title = "" + $("#editTitle").val();
        var msg = "" + $("#editMessage").val();
        // NB: we assume that the user didn't modify the value of #editId
        var id = "" + $("#editId").val();
        if (title === "" || msg === "") {
            window.alert("Error: title or message is not valid");
            return;
        }
        // set up an AJAX post.  When the server replies, the result will go to
        // onSubmitResponse
        $.ajax({
            type: "PUT",
            // url: "/messages/" + id,
            url: backendUrl + "/messages",
            dataType: "json",
            data: JSON.stringify({ mTitle: title, mMessage: msg }),
            success: editEntryForm.onSubmitResponse
        });
    };
    /**
     * onSubmitResponse runs when the AJAX call in submitForm() returns a
     * result.
     *
     * @param data The object returned by the server
     */
    EditEntryForm.prototype.onSubmitResponse = function (data) {
        // If we get an "ok" message, clear the form and refresh the main 
        // listing of messages
        if (data.mStatus === "ok") {
            editEntryForm.clearForm();
            mainList.refresh();
        }
        // Handle explicit errors with a detailed popup message
        else if (data.mStatus === "error") {
            window.alert("The server replied with an error:\n" + data.mMessage);
        }
        // Handle other errors with a less-detailed popup message
        else {
            window.alert("Unspecified error");
        }
    };
    return EditEntryForm;
}()); // end class EditEntryForm
// Run some configuration code when the web page loads
$(document).ready(function () {
    // Create the object that controls the "New Entry" form
    newEntryForm = new NewEntryForm();
    // Create the object for the main data list, and populate it with data from
    // the server
    mainList = new ElementList();
    mainList.refresh();
    // Create the object that controls the "Edit Entry" form
    editEntryForm = new EditEntryForm();
    // set up initial UI state
    $("#editElement").hide();
    $("#addElement").hide();
    $("#showElements").show();
    // set up the "Add Message" button
    $("#showFormButton").click(function () {
        $("#addElement").show();
        $("#showElements").hide();
    });
});
