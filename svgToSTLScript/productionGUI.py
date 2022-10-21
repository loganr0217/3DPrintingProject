import tkinter as tk
import requests
import os
import json
from tkinter import ttk
from tkinter.messagebox import showinfo

# create the root window
root = tk.Tk()
root.geometry('800x400')
root.resizable(True, True)
root.title('Production GUI')

root.columnconfigure(0, weight=1)
root.rowconfigure(0, weight=1)

r = requests.get("https://backend-dot-lightscreendotart.uk.r.appspot.com/orders")

# create a list box
orders = tuple(r.json())

orderIdMap = dict([])


columns = ("orderId", "email", "status")
tree = tk.ttk.Treeview(root, columns=columns, show="headings")
tree.heading("orderId", text="Order Id")
tree.heading("email", text="Email")
tree.heading("status", text="Status")
minimizedOrderData = []
for i in range(len(orders)):
    order = orders[i]
    tmp = [order[0], order[1], order[18]]
    orderIdMap[order[0]] = i
    minimizedOrderData.append(tmp)
    tree.insert("", tk.END, values=tmp)
    
langs_var = tk.StringVar(value=minimizedOrderData)

# listbox = tk.Listbox(
#     root,
#     listvariable=langs_var,
#     height=6,
#     selectmode='extended')

# listbox.grid(
#     column=0,
#     row=0,
#     sticky='nwes'
# )

# handle event
def items_selected(event):
    """ handle item selected event
    """
    # get selected indices
    selected_indices = listbox.curselection()
    # get selected items
    selected_langs = ",".join([listbox.get(i) for i in selected_indices])
    msg = f'You selected: {selected_langs}'

    showinfo(
        title='Information',
        message=msg)

def testFunction():
    #os.system("make FILES ORDERID=" + )
    for selected_item in tree.selection():
        item = tree.item(selected_item)
        record = item['values']
        orderId = record[0]
        actualIndex = orderIdMap[orderId]
        os.system("make FILES ORDERID="+str(orderId)+" ACTUALINDEX="+str(actualIndex))

def item_selected(event):
    for selected_item in tree.selection():
        item = tree.item(selected_item)
        record = item['values']
        orderId = record[0]
        # show a message
        # tk.messagebox.showinfo(title='Information', message=record[0])


tree.bind('<<TreeviewSelect>>', item_selected)

tree.grid(row=0, column=0, sticky='nsew')

scrollbar = ttk.Scrollbar(root, orient=tk.VERTICAL, command=tree.yview)
tree.configure(yscroll=scrollbar.set)
scrollbar.grid(row=0, column=1, sticky='ns')

fileButton = tk.Button(root, text="Generate Files", command=testFunction)
fileButton.grid(row=1, column=0)

# listbox.bind('<<ListboxSelect>>', items_selected)

root.mainloop()