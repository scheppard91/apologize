set :application, "apologize"
set :domain,      "azer@apologize.ovh"
set :deploy_to,   "/usr/share/nginx/apologize"
set :app_path,    "app"
set :user,        "azer"

set :repository,  "git@bitbucket.org:apologize/apologize.git"
set :scm,         :git
# Or: `accurev`, `bzr`, `cvs`, `darcs`, `subversion`, `mercurial`, `perforce`, or `none`

set :model_manager, "doctrine"
# Or: `propel`

role :web,        domain                         # Your HTTP server, Apache/etc
role :app,        domain, :primary => true       # This may be the same as your `Web` server

set :use_sudo, true
set  :keep_releases,  3

set :shared_files, ["app/config/parameters.yml"] 
set :shared_children, [app_path + "/logs", "vendor"] 

set :use_composer, true
set :update_vendors, false

set :writable_dirs, ["app/cache", "app/logs"]
set :webserver_user, "www-data"
set :permission_method, :chown
set :use_set_permissions, true
set :dump_assetic_assets, true 

logger.level = Logger::MAX_LEVEL

after "deploy:finalize_update" do
run "chown -R dizda:www-data #{latest_release}"
run "sudo chmod -R 777 #{latest_release}/#{cache_path}"
run "sudo chmod -R 777 #{latest_release}/#{log_path}"
end

# Be more verbose by uncommenting the following line
# logger.level = Logger::MAX_LEVEL
