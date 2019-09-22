# Pakketti
A package manager and storefront for multi-platform packages.  
Created as a university project, but with a production environment in mind.

## Apache Setup
Open ```/etc/apache2/apache2.conf``` in your favorite editor and change ```AllowOverride None``` for your default web directory to ```AllowOverride All```. This makes Apache recognize ```.htaccess``` files.

```
<Directory /var/www/>
    Options Indexes FollowSymLinks
    AllowOverride All
    Require all granted
</Directory>
```

Then you need to enable these modules, if not enabled already
```bash
sudo a2enmod rewrite
sudo a2enmod proxy
sudo a2enmod proxy_http
```

## Start Server
```
# Make the start script executable
chmod +x start.sh

# Launch in foreground
npm start -- <options>

# Launch in background
screen -AmdS Pakketti "./start.sh  <options>"
```

### Launch Parameters
```--no-api```: Disables the API  
```--no-apt```: Disables the APT/Cydia portion of the API  
```--no-static```: Disables serving static routes, such as ```/files``` and ```/media```
```--no-dashboard, --no-storefront```: Disables serving of the Dashboard or the Storefront, respectively