#! /usr/bin/python

import logging
import sys
logging.basicConfig(stream=sys.stderr)
sys.path.insert(0, '/var/www/html/flask')
from main import app as application
application.secret_key = 'anything you wish'
