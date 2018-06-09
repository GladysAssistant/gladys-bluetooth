# gladys-bluetooth 

The main goal of this module is to scan bluetooth inside the house to detect devices we have on us.

Examples :

- [FitBit Charge 2](https://www.amazon.fr/gp/product/B01KSX392O)
- A [Nut mini](https://www.amazon.fr/gp/product/B01AUNMQMG) Bluetooth keychain
- [Xiaomi Mi Band 2](https://www.amazon.fr/gp/product/B01N011RPS)

Thanks to these devices, Gladys is able to know when I'm at home or not, because if I'm at home, my Fitbit or my keys are probably on me. 

The second goal is to retrieve data from BLE devices.

Examples :

- [Xiaomi Flower Care](https://www.amazon.fr/gp/product/dp/B01LXOJSWA)
- [Xiaomi Mi Temperature and Humidity Monitor](https://www.amazon.fr/gp/product/B078W719XH)
- Parrot Flower Power

## Installation

Connect to your Raspberry Pi.

Clone this repository : 

```
git clone https://github.com/GladysProject/gladys-bluetooth
```

Go the directory : 

```
cd gladys-bluetooth
```

Install the dependencies : 

If you have yarn (pre-installed on Gladys Raspbian image), just do : 

```
yarn install
```

If not, you can do :

```
npm install
```

You now need to modify the `config.js` file : 

```
nano config.js
```

Edit each line with your configuration.

To allow the node process to access bluetooth without sudo rights, execute : 

```
sudo setcap cap_net_raw+eip $(eval readlink -f `which node`)
```

## Usage

You first need to scan devices around you so they are added to Gladys. To do that, execute : 

```
node /home/pi/gladys-bluetooth/setup.js
```

You should see your bluetooth devices that are around. For person detection, go in Gladys and affect to them the devices they own. (For example, assign your Nut to your account in Gladys, in the Device view).

## Running the scanner

Then, when all your devices are already in Gladys, execute:

```
pm2 start /home/pi/gladys-bluetooth/app.js --name gladys-bluetooth
```

So that gladys-bluetooth run in background :)