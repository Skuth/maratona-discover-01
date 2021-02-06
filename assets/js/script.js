const $ = document.querySelector.bind(document)

const Storage = {
  get() {
    return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
  },
  set() {
    localStorage.setItem("dev.finances:transactions", JSON.stringify(Transaction.all))
  }
}

const Transaction = {
  all: Storage.get(),
  add(transaction) {
    Transaction.all.push(transaction)
    App.reload()
  },
  edit(transaction, index) {
    Transaction.all[index] = transaction
    App.reload()
  },
  remove(index) {
    Transaction.all.splice(index, 1)
    App.reload()
  },
  incomes() {
    let income = 0

    Transaction.all.forEach(({ amount }) => {
      if (amount > 0) income += amount
    })

    return income
  },
  expenses() {
    let expense = 0

    Transaction.all.forEach(({ amount }) => {
      if (amount < 0) expense += amount
    })

    return expense
  },
  total() {
    return Transaction.incomes() + Transaction.expenses()
  }
}

const Modal = {
  open() {
    $(".modal__container").classList.remove("modal--close")
    $(".modal__container").classList.add("modal--active")
  },
  close() {
    $(".modal__container").classList.remove("modal--active")
    $(".modal__container").classList.add("modal--close")

    setTimeout(() => {
      $(".modal__container").classList.remove("modal--close")
      Form.clearFields()
      Form.resetErros()
      Form.resetEditVerify()
    }, 500)
  }
}

const DOM = {
  transactionContainer: $("#table__container tbody"),
  addTransaction(transaction, index) {
    const newTransaction = DOM.innerHTMLTransaction(transaction, index)
    DOM.transactionContainer.appendChild(newTransaction)
    DOM.updateBalance()
  },
  innerHTMLTransaction({ description, amount, date }, index) {
    const tableItem = document.createElement("tr")
    tableItem.dataset.index = index
    tableItem.classList.add("table--fadeIn")

    const descriptionItem = document.createElement("td")
    descriptionItem.appendChild(document.createTextNode(description))

    const amountItem = document.createElement("td")
    amountItem.appendChild(document.createTextNode(Utils.formatCurrency(amount)))
    
    amount > 0 ? amountItem.classList.add("table--income") : amountItem.classList.add("table--expense")

    const dateItem = document.createElement("td")
    dateItem.appendChild(document.createTextNode(Utils.formatDate(date)))

    const actionItem = document.createElement("td")

    const actionEdit = document.createElement("img")
    actionEdit.src="./assets/images/edit.svg"
    actionEdit.alt="Icone de editar transação"
    actionEdit.addEventListener("click", () => {
      Form.setValues({ description, amount, date }, index)
      Modal.open()
    })
    
    const actionRemove = document.createElement("img")
    actionRemove.src="./assets/images/minus.svg"
    actionRemove.alt="Icone de remover transação"
    actionRemove.addEventListener("click", () => Transaction.remove(index))

    actionItem.appendChild(actionEdit)
    actionItem.appendChild(actionRemove)

    tableItem.appendChild(descriptionItem)
    tableItem.appendChild(amountItem)
    tableItem.appendChild(dateItem)
    tableItem.appendChild(actionItem)

    return tableItem
  },
  updateBalance() {
    const incomeItem = $("#card--income")
    const expenseItem = $("#card--expense")
    const totalItem = $("#card--total")

    incomeItem.innerHTML = Utils.formatCurrency(Transaction.incomes())
    expenseItem.innerHTML = Utils.formatCurrency(Transaction.expenses())
    totalItem.innerHTML = Utils.formatCurrency(Transaction.total())
  },
  clearTransactions() {
    DOM.transactionContainer.innerHTML = ""
  }
}

const Utils = {
  formatCurrency(value) {
    const signal = Number(value) < 0 ? "-" : ""
    
    value = String(value).replace(/\D/g, "")
    value = Number(value) / 100
    value = value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    })

    return `${signal} ${value}`
  },
  formatAmount(value) {
    value = Number(value) * 100
    return value
  },
  formatDate(date) {
    return moment(date).format("DD/MM/YYYY")
  }
}

const Form = {
  inputs: {
    description: $("input#description"),
    amount: $("input#amount"),
    date: $("input#date"),
    edit: $("input#edit")
  },
  setValues({description, amount, date}, index) {
    Form.inputs.description.value = description
    Form.inputs.amount.value = (amount / 100)
    Form.inputs.date.value = date,
    Form.inputs.edit.value = true
    Form.inputs.edit.dataset.index = index
  },
  getValues() {
    return {
      description: Form.inputs.description.value,
      amount: Form.inputs.amount.value,
      date: Form.inputs.date.value
    }
  },
  resetEditVerify() {
    Form.inputs.edit.value = false
    Form.inputs.edit.dataset.index = ""
  },
  validateFields() {
    Form.resetErros()

    const { description, amount, date } = Form.getValues()
    
    if (
      description.trim() === "" ||
      amount.trim() === "" ||
      date.trim() === ""
    ) throw new Error("Por favor, preencha todos os campos.")

  },
  formatValues() {
    let { description, amount, date } = Form.getValues()
    amount = Utils.formatAmount(amount)

    return {
      description,
      amount,
      date
    }
  },
  clearFields() {
    Form.inputs.description.value = ""
    Form.inputs.amount.value = ""
    Form.inputs.date.value = ""
  },
  resetErros() {
    Object.values(Form.inputs).map(input => {
      input.classList.remove("input--error")
    })
  },
  submit(e) {
    e.preventDefault()
    
    try {
      Form.validateFields()

      const transaction = Form.formatValues()

      if (Form.inputs.edit.value == "true") {
        const index = Form.inputs.edit.getAttribute("data-index")
        Transaction.edit(transaction, index)
      } else {
        Transaction.add(transaction)
      }

      Modal.close()
    } catch (error) {
      Object.values(Form.inputs).map(input => {
        if (input.value === "") {
          input.classList.add("input--error")
        }
      })
    }
  }
}

const App = {
  init() {
    Transaction.all.forEach(DOM.addTransaction)
    DOM.updateBalance()
    Storage.set()
  },
  reload() {
    DOM.clearTransactions()
    App.init()
  }
}

App.init()