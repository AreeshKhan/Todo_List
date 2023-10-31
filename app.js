//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
//npm i lodash using lodash to play with the string(to capitalize,uppercase etc)
const lodash = require("lodash");
// const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
mongoose.connect('mongodb://127.0.0.1:27017/todolistDB')
  .then(() => {
    console.log("Mongo CONNECTION OPEN!!")
  })
  .catch(err => {
    console.log(err)
  })

const itemsSchema = {
  name: String
}

const Item = mongoose.model("Item", itemsSchema)

const item1 = new Item({
  name: "Welcome to your todolist!"
});
const item2 = new Item({
  name: "Hit the + button to add a new item"
});
const item3 = new Item({
  name: "<-- Hit this to delete an item"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};
const List = mongoose.model("List", listSchema)

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

app.get("/", async (req, res) => {

  // const day = date.getDate();
  const items = await Item.find({})
  // console.log(items)
  if (items.length === 0) {
    Item.insertMany(defaultItems)
      .then(res => {
        // console.log("hellloo")
      })
      .catch(err => {
        console.log(err)
      })
    res.redirect("/");
  } else {
    res.render("list", { listTitle: "Today", newListItems: items });

  }
  // res.render("list",{listTitle: "Today",items})

});

app.post("/", async (req, res) => {

  const itemName = req.body.newItem;
  const listTitle = req.body.list;
  const item = await new Item({
    name: itemName
  });
  if (listTitle === "Today") {
    item.save();
    res.redirect("/");
  } else {
    const newItem = await List.findOne({ name: listTitle });
    newItem.items.push(item);
    newItem.save();
    res.redirect("/" + listTitle);

  }


});

app.post("/delete", async (req, res) => {
  const checkedItemId = (req.body.checkbox);
  const listTitle = req.body.listName;

  if (listTitle === "Today") {
    await Item.findByIdAndDelete(checkedItemId);
    res.redirect("/")
  }
  else {
    await List.findOneAndUpdate({ name: listTitle }, { $pull: { items: { _id: checkedItemId } } });
    res.redirect("/" + listTitle)
  }
  // await Item.findByIdAndDelete(checkedItemId);
  // res.redirect("/");

})
app.get("/:customListName", async (req, res) => {
  // console.log(req.params.customListName);
  const customListName = lodash.capitalize(req.params.customListName);
  const foundList = await List.findOne({ name: customListName })
  // .then(function(err,foundList){
  // if(!err){
  if (!foundList) {
    const list = await new List({
      name: customListName,
      items: defaultItems
    });
    list.save();
    res.render("list", { listTitle: list.name, newListItems: list.items });

  } else {
    res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
  }
})
// res.render("list", {listTitle:customListName , newListItems: list})
// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
