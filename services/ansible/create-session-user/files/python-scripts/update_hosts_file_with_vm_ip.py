import argparse
import requests
import sys

def parse_args():
    """
    :return parser.parse_args():
    This function parses the passed in system arguments.
    """
    parser = argparse.ArgumentParser(
        formatter_class=argparse.RawDescriptionHelpFormatter,
        description='''
    Description:
    This script will retrieve the MS and WLVM IP for a cluster id
    ''',
        epilog='''
    Examples:
      -> ''' + sys.argv[0] + ''' -c 306 -i ms1
      -> ''' + sys.argv[0] + ''' -c 339 -i wlvm
    '''
    )
    parser.add_argument("-c", "--cluster_id",
                        help="Environment name you want to write the VM name of in the ansible"
                             " hosts file",
                        required=True)
    parser.add_argument("-i", "--vm_to_write_ip_of",
                        help="The VM name you want to write the IP of in the ansible hosts file.",
                        required=True)

    if len(sys.argv[1:]) == 0:
        print("No arguments passed in")
        parser.print_help()
        parser.exit()
    return parser.parse_args()


def cluster_id_json_object(cluster_id):
    """
    :param cluster_id:
    :return json_returned:
    This function returns the JSON object that is
    retrieved from the CIFWK REST call that uses
    the passed in cluster ID for the URL.
    """
    ci_portal_url = "https://ci-portal.seli.wh.rnd.internal.ericsson.com/generateTAFHostPropertiesJSON/?clusterId=" + str(cluster_id)
    response = requests.get(url = ci_portal_url)
    json_returned = response.json()
    return json_returned

def search_for_ms_ip(cluster_id):
    """
    :param cluster_id:
    :return ms_ip:
    This function searches for and returns
    the IP of the MS by passing in the associated
    cluster ID.
    """
    print("Searching for {0}'s MS IP".format(str(cluster_id)))
    if 'atvts' in str(cluster_id):
        if 'athtem' in str(cluster_id):
            return str(cluster_id)
        else:
            return str(cluster_id) + '.athtem.eei.ericsson.se'
    else:
        json_returned = cluster_id_json_object(cluster_id)
        for item in json_returned:
            if type(item) is dict:
                for key, value in item.items():
                    if key == 'hostname' and value == 'ms1':
                        ms_ip = item['ip']
                        print(str(ms_ip))
                        return ms_ip
    print("MS IP cannot be obtained for " + str(cluster_id))
    sys.exit(1)

def search_for_wlvm_ip(cluster_id):
    """
    :param cluster_id:
    :return wlvm_ip:
    This function searches for and returns
    the IP of the WLVM by passing in the associated
    cluster ID.
    """
    print("Searching for {0}'s WLVM IP".format(str(cluster_id)))
    if 'atvts' in str(cluster_id):
        if 'athtem' in str(cluster_id):
            return str(cluster_id)
        else:
            return str(cluster_id) + '.athtem.eei.ericsson.se'
    else:
        json_returned = cluster_id_json_object(cluster_id)
        for item in json_returned:
            if type(item) is dict:
                for key, value in item.items():
                    if key == 'hostname' and 'wlvm' in value:
                        list_of_interfaces = item["interfaces"]
                        for interface in list_of_interfaces:
                            if interface["type"] == "public":
                                workload_ip = interface["ipv4"]
                                print(str(workload_ip))
                                return workload_ip
    print("WLVM IP cannot be obtained for " + str(cluster_id))
    sys.exit(1)


def write_hostname_ip_to_hosts_file(cluster_id, hostname_ip, hostname):
    """
    :param cluster_id;
    :param hostname_ip:
    :param hostname:
    This function writes the retrieved hostname ip into the hosts file.
    """
    print("Writing the retrieved {hostname} ip and into the hosts file")
    hosts_file = open("/etc/ansible/hosts", "a")
    hosts_file.write("[{0}_{1}]\n{2}\n".format(cluster_id, hostname, hostname_ip))
    hosts_file.close()


if __name__ == "__main__":
    args = parse_args()
    
    if args.vm_to_write_ip_of == 'ms1':
        ms_ip = search_for_ms_ip(args.cluster_id)
        write_hostname_ip_to_hosts_file(args.cluster_id, ms_ip, args.vm_to_write_ip_of)
    elif args.vm_to_write_ip_of == 'wlvm':
        wlvm_ip = search_for_wlvm_ip(args.cluster_id)
        write_hostname_ip_to_hosts_file(args.cluster_id, wlvm_ip, args.vm_to_write_ip_of)
    else:
        print("Invalid vm_to_write_ip_of passed in. Valid options are 'ms1' or 'wlvm'")
        sys.exit(1)