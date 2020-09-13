## Installation on Raspberry Pi OS (previously called Raspbian):
To make the installation as simple as possible, we have created an installation script for you. It will setup your Raspberry Pi (using Apache Webserver) as a full blown Photobooth. This means, Photobooth and all needed packages and dependencies get installed and the automatic camera mount is disabled. On request you can setup that Photobooth is started in fullscreen on startup.

If you encounter any issues or want more freedom to configure your Pi, we recommend you look at the detailed installation instruction below.

```
wget https://raw.githubusercontent.com/andi34/photobooth/dev/install-raspbian.sh
sudo bash install-raspbian.sh
```
By default Apache is used for an easy and no-hassle setup as NGINX and Lighttpd need some additional steps.
To use NGINX run `sudo bash install-raspbian.sh nginx` (additional Setup note: [Cromakeying is saving without finishing saving](FAQ#cromakeying-is-saving-without-finishing-saving) ),
To use Lighttpd as Webserver run `sudo bash install-raspbian.sh lighttpd`.


## Installation on Debian / Debian based distributions:
The steps below were tested on "Raspberry Pi OS (previously called Raspbian) with desktop" based on Debian Buster, but should work for Debian and all Debian based distributions. Photobooth can also be used on any other PC/Laptop running a supported OS.

### Update your system
```
sudo apt update
sudo apt dist-upgrade
```

### Install a Webserver
Currently NGINX, Lighttpd and Apache Webserver are supported.
For an easy and no-hassle setup you should install Apache Webserver.
NGINX has a smaller memory footprint and typically better performance, which is especially important on the Raspberry Pis, but it needs some additional steps until you're good to go. Also Lighttpd needs some additional steps.

#### Install Apache & PHP
```
sudo apt install -y libapache2-mod-php
```

#### or Install NGINX & PHP
```
sudo apt install -y nginx php-fpm
```
<details><summary><b>Additional needed steps to enable PHP in NGINX</b></summary>

Once NGINX is installed we need to enable PHP in NGINX. If you haven't made any changes to your NGINX config you can run the following commands:
```
sudo cp /etc/nginx/sites-enabled/default ~/nginx-default.bak
sudo sed -i 's/^\(\s*\)index index\.html\(.*\)/\1index index\.php index\.html\2/g' /etc/nginx/sites-available/default
sudo sed -i '/location ~ \\.php$ {/s/^\(\s*\)#/\1/g' /etc/nginx/sites-available/default
sudo sed -i '/include snippets\/fastcgi-php.conf/s/^\(\s*\)#/\1/g' /etc/nginx/sites-available/default
sudo sed -i '/fastcgi_pass unix:\/run\/php\//s/^\(\s*\)#/\1/g' /etc/nginx/sites-available/default
sudo sed -i '/.*fastcgi_pass unix:\/run\/php\//,// { /}/s/^\(\s*\)#/\1/g; }' /etc/nginx/sites-available/default
```

If you've made changes by hand already to `/etc/nginx/sites-enabled/default` you have to do all changes by hand:
```
sudo nano /etc/nginx/sites-enabled/default
```
Find the line `index index.html index.htm;` and add `index.php` after `index` (the line now should look like this: `index index.php index.html index.htm;`).

Now scroll down until you find a section with the following content:
```
# pass the PHP scripts to FastCGI server
#
# location ~ \.php$ {
```

Edit by removing the `#` characters on the following lines:
```
location ~ \.php$ {
    include snippets/fastcgi-php.conf;
    fastcgi_pass unix:/run/php/php7.3-fpm.sock;
}
```
It should look like this:
```
        location ~ \.php$ {
                include snippets/fastcgi-php.conf;
        #
        #       # With php-fpm (or other unix sockets):
                fastcgi_pass unix:/run/php/php7.3-fpm.sock;
        #       # With php-cgi (or other tcp sockets):
        #       fastcgi_pass 127.0.0.1:9000;
        }
```


Test the config once `/etc/nginx/sites-enabled/default` was changed:
```
sudo /usr/sbin/nginx -t -c /etc/nginx/nginx.conf &>/dev/null && echo 'config test ok' || echo 'config test failed'
```
If you get the response
```bash
'config test ok'
```
then it is time to restart the server with:
```
sudo systemctl reload nginx
```
</details>

#### or Install Lighttpd & PHP
```
sudo apt install -y lighttpd php-fpm
```

<details><summary><b>Additional needed steps to enable PHP in Lighttpd</b></summary>

```
sudo lighttpd-enable-mod fastcgi
sudo lighttpd-enable-mod fastcgi-php
```
Edit fastcgi-php config, keep a backup of the original file in case something went wrong:
```
sudo cp /etc/lighttpd/conf-available/15-fastcgi-php.conf /etc/lighttpd/conf-available/15-fastcgi-php.conf.bak
sudo nano /etc/lighttpd/conf-available/15-fastcgi-php.conf
```
Change the `15-fastcgi-php.conf` from
```
# -*- depends: fastcgi -*-
# /usr/share/doc/lighttpd/fastcgi.txt.gz
# http://redmine.lighttpd.net/projects/lighttpd/wiki/Docs:ConfigurationOptions#mod_fastcgi-fastcgi

## Start an FastCGI server for php (needs the php5-cgi package)
fastcgi.server += ( ".php" => 
	((
		"bin-path" => "/usr/bin/php-cgi",
		"socket" => "/var/run/lighttpd/php.socket",
		"max-procs" => 1,
		"bin-environment" => ( 
			"PHP_FCGI_CHILDREN" => "4",
			"PHP_FCGI_MAX_REQUESTS" => "10000"
		),
		"bin-copy-environment" => (
			"PATH", "SHELL", "USER"
		),
		"broken-scriptfilename" => "enable"
	))
)
```
to look like this:
```
# -*- depends: fastcgi -*-
# /usr/share/doc/lighttpd/fastcgi.txt.gz
# http://redmine.lighttpd.net/projects/lighttpd/wiki/Docs:ConfigurationOptions#mod_fastcgi-fastcgi

## Start an FastCGI server for php (needs the php5-cgi package)
fastcgi.server += ( ".php" => 
	((
		"socket" => "/var/run/php/php7.3-fpm.sock",
		"broken-scriptfilename" => "enable"
	))
)
```

Now reload the service:
```
sudo service lighttpd force-reload
```
</details>


### Install dependencies
```
sudo apt install -y git php-gd gphoto2 libimage-exiftool-perl nodejs
```

To install all client dependencies you also have to [install yarn](https://yarnpkg.com/lang/en/docs/install/#debian-stable):
```
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt update && sudo apt install -y yarn
```

**Optional:** If you have a new camera, you can also install the latest version of libgphoto2 directly from the maintainer. Choose "Install last stable release":
```
wget https://raw.githubusercontent.com/gonzalo/gphoto2-updater/master/gphoto2-updater.sh && sudo bash gphoto2-updater.sh
```

### Install photobooth
Give our webserver user access to `/var/www/`:
```
sudo chown -R www-data:www-data /var/www/
```

Get the Photobooth source:
```
cd /var/www/
sudo -u www-data -s
rm -r html/*
git clone https://github.com/andi34/photobooth html
cd /var/www/html
git submodule update --init
yarn install
yarn build
exit
```
**Please note:** depending on your hardware `yarn install` and `yarn build` takes up to 15min!

Next we have to give our webserver user access to the USB device:
```
sudo gpasswd -a www-data plugdev
```

If you like to use a printer you need to have `CUPS` installed. On Raspbian `CUPS` is not installed by default:

```
sudo apt install -y cups
```

Next you also have to add your webserver user to the `lp` and `lpadmin` group:

```
sudo gpasswd -a www-data lp
sudo gpasswd -a www-data lpadmin
```

### Install Remote Buzzer support
The following steps are optional, please only apply if you like to use the remote buzzer feature on a Raspberry PI. A reboot is needed to apply `dtoverlay` settings during Raspberry PI OS kernel startup.
```
usermod -a -G gpio www-data

cat > /etc/udev/rules.d/20-photobooth-gpiomem.rules <<EOF
SUBSYSTEM=="bcm2835-gpiomem", KERNEL=="gpiomem", GROUP="gpio", MODE="0660"
EOF

cat >> /boot/config.txt  << EOF
dtoverlay=gpio-no-irq
EOF
```

### Try it out

Now you should restart your Raspberry Pi to apply those settings:
```
reboot
```

Please use the following to test if your Webserver is able to take pictures:
```
sudo -u www-data gphoto2 --capture-image
```

If it is not working, your operation system probably automatically mounted your camera. You can unmount it, or remove execution permission for gphoto2 Volume Monitor to ensure that the camera is not mounted anymore:
```
sudo chmod -x /usr/lib/gvfs/gvfs-gphoto2-volume-monitor
```

Now reboot or unmount your camera with the following commands (you get a list of mounted cameras with `gio mount -l`):
```
gio mount -u gphoto2://YOUR-CAMERA
```
Now try again.

If everything is working, open the IP address (you get it via `ip addr`) of your Raspberry Pi, or if you open it on your machine, type `localhost` in your browser.

