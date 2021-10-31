/**
 Renderer script for Payment Summary Window
**/

// DOM Nodes
const cartItemsContainer = document.getElementById("cart-items");
const doneBtn = document.getElementById("done-btn");

const pricePerMemberPts = 500;


window.paymentAPI.receive ("cart-items", (data) => {

  // set invoice date, number and customer
  document.getElementById("cust-name").innerHTML = data?.memberDetails?.fullname ? data.memberDetails.fullname : "Guest";
  document.getElementById("invoice-time").innerHTML = (new Date()).toLocaleDateString();

  data.items.forEach( (item, idx) => {

    displayCartItems(idx + 1, item)
  });

  displayTotal(data.total, data.memberPts);
});


/**
# Close the payment summary and save
**/
doneBtn.addEventListener("click", e => {
  // save the detail in server

  // close the payment summary window
  window.paymentAPI.send("close-payment-summary-window", "");
});



/**
# Display Cart items
**/
function displayCartItems (idx, item) {

  const row = document.createElement("div");
  row.setAttribute("class", "row");

  // number
  row.appendChild(createCartItemColumn(idx, "s"));
  row.appendChild(createCartItemColumn(item.qty, "s"));
  row.appendChild(createCartItemColumn(item.name, "l"));
  row.appendChild(createCartItemColumn(item.price, "s"));

  cartItemsContainer.appendChild(row);
}


function createCartItemColumn (content, size) {
  const col = document.createElement("div");
  size === "s" ? col.setAttribute("class", "col") : col.setAttribute("class", "col-8");

  const contentText = document.createElement("h6");
  contentText.setAttribute("class", "text-secondary");
  contentText.innerHTML = content;

  col.appendChild(contentText);

  return col;
}


/**
# Total Payable Amount
**/
function displayTotal(total, memberPts) {

  const row = document.createElement("div");
  row.setAttribute("class", "row mt-2");

  const hr = document.createElement("hr");
  hr.setAttribute("class", "bg-secondary px-2");
  cartItemsContainer.appendChild(hr);


  const label = document.createElement("small");
  label.setAttribute("class", "text-muted col");
  label.innerHTML = "total :";


  const priceDiv = document.createElement("div");
  priceDiv.setAttribute("class", "col d-flex align-items-center justify-content-end mr-5");
  priceDiv.style.marginRight = "35px";

  if (memberPts > 0) {

    const memberPointsInfo = document.createElement("small");
    memberPointsInfo.setAttribute("class", "text-danger");
    memberPointsInfo.innerHTML = `* ${memberPts} Member points applied.`;
    cartItemsContainer.appendChild(memberPointsInfo);

    /** show total price before member pts deduction */
    const totalPrice = document.createElement("small");
    totalPrice.setAttribute("class", "text-info mx-1");
    totalPrice.innerHTML = `<del>${total} </del>`;
    priceDiv.appendChild(totalPrice);
  }

  const finalTotalPrice = document.createElement("span");
  finalTotalPrice.setAttribute("class", "text-seondary mr-5");
  finalTotalPrice.innerHTML = `${total - (memberPts * pricePerMemberPts)} ks`;

  priceDiv.appendChild(finalTotalPrice);

  row.appendChild(label);
  row.appendChild(priceDiv);

  cartItemsContainer.appendChild(row);
}
