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

    const descriptionItem = document.createElement("td")
    descriptionItem.appendChild(document.createTextNode(description))

    const amountItem = document.createElement("td")
    amountItem.appendChild(document.createTextNode(Utils.formatCurrency(amount)))
    
    amount > 0 ? amountItem.classList.add("table--income") : amountItem.classList.add("table--expense")

    const dateItem = document.createElement("td")
    dateItem.appendChild(document.createTextNode(date))

    const actionItem = document.createElement("td")
    
    const actionImage = document.createElement("img")
    actionImage.src="./assets/images/minus.svg"
    actionImage.alt="Icone de remover transação"

    actionItem.appendChild(actionImage)
    actionItem.addEventListener("click", () => Transaction.remove(index))

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
    date: $("input#date")
  },
  getValues() {
    return {
      description: Form.inputs.description.value,
      amount: Form.inputs.amount.value,
      date: Form.inputs.date.value
    }
  },
  validateFields() {
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
    date = Utils.formatDate(date)

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
  submit(e) {
    e.preventDefault()
    
    try {
      Form.validateFields()

      const transaction = Form.formatValues()

      Transaction.add(transaction)
      Form.clearFields()
      Modal.close()
    } catch (error) {
      alert(error.message)
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